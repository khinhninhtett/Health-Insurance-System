import UserPlanModel from "../models/userPlanModel.js";
import PaymentModel from "../models/paymentModel.js";
import UserModel from "../models/userModel.js";
import CobolService from "./cobolService.js";
import NotificationService from "./notificationService.js";

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function endDateFor(billingCycle, start) {
  const end = new Date(start);
  if (billingCycle === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

class PaymentService {
  static async submit(userId, { method, transactionId, amount, billingCycle }, receiptFile) {
    if (!["monthly", "yearly"].includes(billingCycle)) {
      throw new Error("Choose a billing cycle: monthly or yearly.");
    }

    const userPlan = await UserPlanModel.findLatestByUserId(userId);

    if (!userPlan || userPlan.status !== "pending_payment") {
      throw new Error("Complete medical verification before submitting payment.");
    }

    const expectedAmount = billingCycle === "yearly" ? userPlan.annual_premium : userPlan.monthly_premium;

    const cobolFeedback = await CobolService.execute("activate_policy", [
      String(Math.round(expectedAmount)),
      String(Math.round(amount)),
    ]);

    const note = cobolFeedback.status === "VERIFIED"
      ? "Amount matches the required premium. Awaiting admin approval."
      : "Amount does not match the required premium — flagged for admin review.";

    const payment = await PaymentModel.create({
      userId,
      userPlanId: userPlan.id,
      method,
      transactionId,
      amount,
      billingCycle,
      receiptPath: receiptFile ? receiptFile.filename : null,
    });

    await PaymentModel.updateStatus(payment.id, { status: "pending", reason: note });
    await UserPlanModel.setBillingCycle(userPlan.id, billingCycle);

    const user = await UserModel.findById(userId);
    await NotificationService.notifyAdmins(
      "New payment submitted",
      `${user?.name || "A customer"} submitted a ${billingCycle} payment awaiting your approval.`,
      "/admin/payments"
    );

    return {
      payment: await PaymentModel.findById(payment.id),
      message: "Payment submitted. An admin will review and activate your policy shortly.",
    };
  }

  static async getMyPayments(userId) {
    return PaymentModel.findByUserId(userId);
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
      reason: decision === "approved" ? "Approved by admin. Policy activated." : "Rejected by admin.",
    });

    if (decision === "approved") {
      const start = new Date();
      const end = endDateFor(payment.billing_cycle, start);
      await UserPlanModel.updateStatus(payment.user_plan_id, "active", {
        startDate: toDateString(start),
        endDate: toDateString(end),
      });
    }

    await NotificationService.notifyCustomer(
      payment.user_id,
      decision === "approved" ? "Payment approved" : "Payment rejected",
      decision === "approved"
        ? "Your payment was approved and your policy is now active."
        : "Your payment was rejected. Please review and resubmit.",
      decision === "approved" ? "/customer/insurance-card" : "/customer/payment"
    );

    return PaymentModel.findById(paymentId);
  }
}

export default PaymentService;
