import PlanModel from "../models/planModel.js";
import UserPlanModel from "../models/userPlanModel.js";
import UserModel from "../models/userModel.js";

const OPEN_STATUSES = ["pending_medical", "pending_payment", "active"];

function generatePolicyNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `POL-${year}-${suffix}`;
}

class PlanService {
  static async selectPlan(userId, planId) {
    const user = await UserModel.findById(userId);

    if (!user || user.verification_status !== "verified") {
      throw new Error("Please verify your identity before purchasing insurance.");
    }

    const existing = await UserPlanModel.findLatestByUserId(userId);

    if (existing && OPEN_STATUSES.includes(existing.status)) {
      throw new Error(`You already have an enrollment in progress (status: ${existing.status}).`);
    }

    const plan = await PlanModel.findById(planId);

    if (!plan || plan.status !== "active") {
      throw new Error("Selected plan is not available.");
    }

    return UserPlanModel.create({
      userId,
      planId: plan.id,
      monthlyPremium: plan.monthly_premium,
      annualPremium: plan.annual_premium,
      coverageAmount: plan.coverage_amount,
      policyNumber: generatePolicyNumber(),
    });
  }

  static async getMyPlan(userId) {
    return UserPlanModel.findLatestByUserId(userId);
  }
}

export default PlanService;
