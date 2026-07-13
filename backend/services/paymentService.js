import UserPlanModel from "../models/userPlanModel.js";
import PaymentModel from "../models/paymentModel.js";
import InstallmentModel from "../models/installmentModel.js";
import UserModel from "../models/userModel.js";
import CobolService from "./cobolService.js";
import NotificationService from "./notificationService.js";

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

// Adds months without rolling into the following month when the start day
// doesn't exist in the target month (e.g. Jan 31 + 1 month = Feb 28).
function addMonths(date, months) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

// Every policy lasts 1 year; the annual premium is simply split into 12 when
// paying by monthly installment.
export function installmentAmountFor(annualPremium) {
  return Math.round(Number(annualPremium) / 12);
}

function buildInstallmentRows(annualPremium, startDate, firstPaymentId) {
  const base = installmentAmountFor(annualPremium);
  const rows = [];
  for (let no = 1; no <= 12; no++) {
    rows.push({
      no,
      // Last installment absorbs the rounding difference so 12 payments total
      // exactly the annual premium.
      amount: no === 12 ? Number(annualPremium) - base * 11 : base,
      dueDate: toDateString(addMonths(startDate, no - 1)),
      status: no === 1 ? "paid" : "pending",
      paymentId: no === 1 ? firstPaymentId : null,
    });
  }
  return rows;
}

async function cobolAmountCheck(expectedAmount, amount) {
  try {
    const feedback = await CobolService.execute("activate_policy", [
      String(Math.round(expectedAmount)),
      String(Math.round(amount)),
    ]);
    return feedback.status === "VERIFIED"
      ? "Amount matches the required premium. Awaiting admin approval."
      : "Amount does not match the required premium — flagged for admin review.";
  } catch {
    return "Awaiting admin approval.";
  }
}

class PaymentService {
  static async submit(userId, { method, transactionId, amount, billingCycle }, receiptFile) {
    const userPlan = await UserPlanModel.findLatestByUserId(userId);

    if (!userPlan) {
      throw new Error("Select a plan before submitting payment.");
    }

    let expectedAmount;
    let installmentId = null;
    let cycle;

    if (userPlan.status === "pending_payment") {
      // First payment: the customer picks HOW to pay for the 1-year policy.
      if (!["monthly", "yearly"].includes(billingCycle)) {
        throw new Error("Choose a payment method: annual payment or monthly installment.");
      }
      cycle = billingCycle;
      expectedAmount = cycle === "yearly"
        ? Number(userPlan.annual_premium)
        : installmentAmountFor(userPlan.annual_premium);
    } else if (["active", "suspended"].includes(userPlan.status) && userPlan.billing_cycle === "monthly") {
      // Ongoing monthly installment on an existing 1-year policy.
      const next = await InstallmentModel.findNextUnpaid(userPlan.id);
      if (!next) {
        throw new Error("All installments for this policy year are paid — no payment is due.");
      }
      cycle = "monthly";
      expectedAmount = Number(next.amount);
      installmentId = next.id;
    } else if (userPlan.status === "active") {
      throw new Error("Your annual premium is fully paid — no payment is due this policy year.");
    } else {
      throw new Error("Complete medical verification before submitting payment.");
    }

    const note = await cobolAmountCheck(expectedAmount, amount);

    const payment = await PaymentModel.create({
      userId,
      userPlanId: userPlan.id,
      installmentId,
      method,
      transactionId,
      amount,
      billingCycle: cycle,
      receiptPath: receiptFile ? receiptFile.filename : null,
    });

    await PaymentModel.updateStatus(payment.id, { status: "pending", reason: note });

    if (userPlan.status === "pending_payment") {
      await UserPlanModel.setBillingCycle(userPlan.id, cycle);
    }

    const user = await UserModel.findById(userId);
    await NotificationService.notifyAdmins(
      "New payment submitted",
      installmentId
        ? `${user?.name || "A customer"} submitted a monthly installment payment awaiting your approval.`
        : `${user?.name || "A customer"} submitted a ${cycle === "yearly" ? "full annual" : "first installment"} payment awaiting your approval.`,
      "/admin/payments"
    );

    return {
      payment: await PaymentModel.findById(payment.id),
      message: "Payment submitted. An admin will review it shortly.",
    };
  }

  static async getMyPayments(userId) {
    return PaymentModel.findByUserId(userId);
  }

  // Installment schedule + next due info for the customer's payment page.
  static async getSchedule(userId) {
    const userPlan = await UserPlanModel.findLatestByUserId(userId);
    if (!userPlan) return null;

    const installments = userPlan.billing_cycle === "monthly"
      ? await InstallmentModel.findByUserPlanId(userPlan.id)
      : [];

    return {
      status: userPlan.status,
      billingCycle: userPlan.billing_cycle,
      startDate: userPlan.start_date,
      endDate: userPlan.end_date,
      installmentAmount: installmentAmountFor(userPlan.annual_premium),
      installments,
      nextDue: installments.find((i) => i.status !== "paid") || null,
    };
  }

  static async adminOverride(paymentId, decision) {
    if (!["approved", "rejected"].includes(decision)) {
      throw new Error("Decision must be 'approved' or 'rejected'.");
    }

    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      throw new Error("Payment not found.");
    }

    await PaymentModel.updateStatus(paymentId, {
      status: decision,
      reason: decision === "approved" ? "Approved by admin." : "Rejected by admin.",
    });

    if (decision === "approved") {
      if (payment.installment_id) {
        await this.settleInstallment(payment);
      } else {
        await this.activatePolicy(payment);
      }
    }

    await NotificationService.notifyCustomer(
      payment.user_id,
      decision === "approved" ? "Payment approved" : "Payment rejected",
      decision === "approved"
        ? payment.installment_id
          ? "Your installment payment was approved. Thank you for staying on schedule."
          : "Your payment was approved and your policy is now active for 1 year."
        : "Your payment was rejected. Please review and resubmit.",
      decision === "approved" ? "/customer/insurance-card" : "/customer/payment"
    );

    return PaymentModel.findById(paymentId);
  }

  // First approved payment: activate the policy for exactly one year and, for
  // the installment method, generate the 12-payment schedule.
  static async activatePolicy(payment) {
    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    await UserPlanModel.updateStatus(payment.user_plan_id, "active", {
      startDate: toDateString(start),
      endDate: toDateString(end),
    });

    if (payment.billing_cycle === "monthly") {
      const existing = await InstallmentModel.findByUserPlanId(payment.user_plan_id);
      if (!existing.length) {
        const userPlan = await UserPlanModel.findById(payment.user_plan_id);
        await InstallmentModel.bulkCreate(
          payment.user_plan_id,
          buildInstallmentRows(userPlan.annual_premium, start, payment.id)
        );
      }
    }
  }

  // Ongoing installment approved: mark it paid and lift a suspension once
  // nothing is overdue anymore.
  static async settleInstallment(payment) {
    const installment = await InstallmentModel.findById(payment.installment_id);
    if (installment && installment.status !== "paid") {
      await InstallmentModel.markPaid(installment.id, payment.id);
    }

    const userPlan = await UserPlanModel.findById(payment.user_plan_id);
    if (userPlan?.status === "suspended") {
      const overdueLeft = await InstallmentModel.countOverdue(userPlan.id);
      const stillCovered = userPlan.end_date && new Date(userPlan.end_date) >= new Date();
      if (!overdueLeft && stillCovered) {
        await UserPlanModel.updateStatus(userPlan.id, "active", {});
        await NotificationService.notifyCustomer(
          userPlan.user_id,
          "Policy reinstated",
          "Your overdue installments are settled and your policy is active again.",
          "/customer/insurance-card"
        );
      }
    }
  }
}

export default PaymentService;
