import UserPlanModel from "../models/userPlanModel.js";
import InstallmentModel from "../models/installmentModel.js";
import ReminderModel from "../models/reminderModel.js";
import NotificationService from "./notificationService.js";

// Business rules for monthly installments: reminders at 7 and 3 days before
// the due date, on the due date, then 3 and 7 days overdue. After the grace
// period ends a final notice is sent and the policy is suspended until the
// overdue installments are settled.
const GRACE_PERIOD_DAYS = 14;

// Annual/renewal reminders: 30, 15, 7 days before expiry, on expiry day, and
// once more after expiry (when the policy is also marked expired).
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (24 * 60 * 60 * 1000));
}

function formatMMK(amount) {
  return `${Number(amount).toLocaleString()} MMK`;
}

class ReminderService {
  static start() {
    this.runChecks();
    setInterval(() => this.runChecks(), CHECK_INTERVAL_MS);
    console.log("⏰ Payment & renewal reminder scheduler started (hourly).");
  }

  static async runChecks() {
    try {
      await this.checkInstallments();
      await this.checkRenewals();
    } catch (error) {
      console.error("[reminders] check failed:", error.message);
    }
  }

  // Thresholds use <= / >= (not ==) so a reminder still goes out even if the
  // server was down on the exact day; ReminderModel.logOnce dedupes.
  static async checkInstallments() {
    const installments = await InstallmentModel.findUnpaidForReminders();

    for (const inst of installments) {
      const days = daysUntil(inst.due_date);
      const label = `Installment #${inst.installment_no} (${formatMMK(inst.amount)}) for policy ${inst.policy_number}`;

      if (days < 0 && inst.status === "pending") {
        await InstallmentModel.markOverdue(inst.id);
      }

      const send = (type, title, message) =>
        this.sendOnce({ userPlanId: inst.user_plan_id, installmentId: inst.id, type, userId: inst.user_id, title, message, link: "/customer/payment" });

      if (days > 0 && days <= 7) {
        await send("due_7", "Payment due soon", `${label} is due on ${inst.due_date} (${days} day${days === 1 ? "" : "s"} left).`);
      }
      if (days > 0 && days <= 3) {
        await send("due_3", "Payment due in a few days", `${label} is due on ${inst.due_date}. Please pay on time to keep your coverage.`);
      }
      if (days <= 0) {
        await send("due_0", "Payment due today", `${label} is due today. Please complete your payment.`);
      }
      if (days <= -3) {
        await send("overdue_3", "Payment overdue", `${label} is ${-days} days overdue. Please pay as soon as possible to avoid suspension.`);
      }
      if (days <= -7) {
        await send("overdue_7", "Payment seriously overdue", `${label} is ${-days} days overdue. Your policy will be suspended if it remains unpaid.`);
      }
      if (days <= -GRACE_PERIOD_DAYS && inst.plan_status !== "suspended") {
        const isFirstTime = await this.sendOnce({
          userPlanId: inst.user_plan_id,
          installmentId: inst.id,
          type: "final",
          userId: inst.user_id,
          title: "Final notice — policy suspended",
          message: `${label} was not paid within the ${GRACE_PERIOD_DAYS}-day grace period. Your policy is suspended until payment is received.`,
          link: "/customer/payment",
        });
        if (isFirstTime) {
          await UserPlanModel.updateStatus(inst.user_plan_id, "suspended", {});
          await NotificationService.notifyAdmins(
            "Policy suspended",
            `Policy ${inst.policy_number} was suspended automatically: installment #${inst.installment_no} unpaid past the grace period.`,
            "/admin/customers"
          );
        }
      }
    }
  }

  static async checkRenewals() {
    const plans = await UserPlanModel.findForRenewalReminders();

    for (const plan of plans) {
      const days = daysUntil(plan.end_date);
      const label = `Your ${plan.plan_name} policy ${plan.policy_number}`;

      const send = (type, title, message) =>
        this.sendOnce({ userPlanId: plan.id, installmentId: 0, type, userId: plan.user_id, title, message, link: "/customer/plans" });

      if (days > 0 && days <= 30) {
        await send("renewal_30", "Policy renewal coming up", `${label} expires on ${plan.end_date} (in ${days} days). Renew now to keep uninterrupted coverage.`);
      }
      if (days > 0 && days <= 15) {
        await send("renewal_15", "Policy expires in 2 weeks", `${label} expires on ${plan.end_date}. Renew for another year to stay covered.`);
      }
      if (days > 0 && days <= 7) {
        await send("renewal_7", "Policy expires this week", `${label} expires on ${plan.end_date}. Don't lose your coverage — renew today.`);
      }
      if (days === 0) {
        await send("renewal_0", "Policy expires today", `${label} expires today. Renew now to keep your coverage active.`);
      }
      if (days < 0) {
        await UserPlanModel.updateStatus(plan.id, "expired", {});
        const notified = await send(
          "renewal_after",
          "Policy expired",
          `${label} expired on ${plan.end_date}. You are no longer covered — renew to restore your protection.`
        );
        if (notified) {
          await NotificationService.notifyAdmins(
            "Policy expired",
            `Policy ${plan.policy_number} reached the end of its one-year term and was marked expired.`,
            "/admin/customers"
          );
        }
      }
    }
  }

  // Sends the notification only if this exact reminder hasn't been sent
  // before. Returns whether it was sent now.
  static async sendOnce({ userPlanId, installmentId, type, userId, title, message, link }) {
    const isNew = await ReminderModel.logOnce({ userPlanId, installmentId, type });
    if (isNew) {
      await NotificationService.notifyCustomer(userId, title, message, link);
    }
    return isNew;
  }
}

export default ReminderService;
