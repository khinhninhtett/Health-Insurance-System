import UserPlanModel from "../models/userPlanModel.js";
import ClaimModel from "../models/claimModel.js";
import UserModel from "../models/userModel.js";
import PlanModel from "../models/planModel.js";
import CobolService from "./cobolService.js";
import NotificationService from "./notificationService.js";

function parseBenefits(raw) {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Entries like "All Basic benefits" reference another plan by name and
// are replaced by that plan's (recursively expanded) benefit list.
function expandBenefits(benefits, plansByName, visited = new Set()) {
  const result = [];
  for (const benefit of benefits) {
    const ref = /^all\s+(.+?)\s+benefits$/i.exec(String(benefit).trim());
    if (ref) {
      const plan = plansByName.get(ref[1].toLowerCase());
      if (plan && !visited.has(plan.id)) {
        visited.add(plan.id);
        result.push(...expandBenefits(parseBenefits(plan.benefits), plansByName, visited));
      }
      continue;
    }
    result.push(benefit);
  }
  return [...new Set(result)];
}

class ClaimService {
  static async resolveClaimTypes(planBenefits) {
    const plans = await PlanModel.findAllForAdmin();
    const plansByName = new Map(plans.map((p) => [p.name.toLowerCase(), p]));
    return expandBenefits(parseBenefits(planBenefits), plansByName);
  }

  static async getClaimTypes(userId) {
    const userPlan = await UserPlanModel.findLatestByUserId(userId);
    if (!userPlan) return [];
    return this.resolveClaimTypes(userPlan.plan_benefits);
  }

  static async submit(userId, { type, hospitalName, serviceDate, amount, description }, documentFile) {
    const userPlan = await UserPlanModel.findLatestByUserId(userId);

    if (!userPlan || userPlan.status !== "active") {
      throw new Error("You need an active policy before filing a claim.");
    }

    const allowedTypes = await this.resolveClaimTypes(userPlan.plan_benefits);
    if (!allowedTypes.some((t) => t.toLowerCase() === String(type).toLowerCase())) {
      throw new Error("Selected claim type is not covered by your plan's benefits.");
    }

    const coverageRemaining = userPlan.coverage_amount - userPlan.coverage_used;
    // There is no waiting period anymore: claims can be filed from day one.
    // The COBOL program still enforces a 30-day rule, so clamp the value to
    // keep its recommendation focused on the coverage check only.
    const daysActive = 30;

    // COBOL now only pre-screens the claim; the result is stored as a
    // recommendation for the admin, who makes the final decision.
    let recommendation = "Awaiting admin review.";
    try {
      const cobolFeedback = await CobolService.execute("process_claim", [
        "Y",
        String(coverageRemaining),
        String(Math.round(amount)),
        String(Math.max(daysActive, 0)),
      ]);
      recommendation = `Awaiting admin review. COBOL pre-check recommends ${
        cobolFeedback.status === "APPROVED" ? "approval" : "rejection"
      }: ${cobolFeedback.message}`;
    } catch {
      recommendation = "Awaiting admin review. COBOL pre-check unavailable.";
    }

    const claim = await ClaimModel.create({
      userId,
      userPlanId: userPlan.id,
      hospitalName: hospitalName || null,
      type,
      serviceDate,
      amount,
      description,
      documentPath: documentFile ? documentFile.filename : null,
    });

    await ClaimModel.updateStatus(claim.id, { status: "pending", reason: recommendation });

    const user = await UserModel.findById(userId);
    await NotificationService.notifyAdmins(
      "New claim awaiting review",
      `${user?.name || "A customer"} filed a ${type} claim. Please review and approve or reject it.`,
      "/admin/claims"
    );
    await NotificationService.notifyCustomer(
      userId,
      "Claim submitted",
      `Your ${type} claim has been submitted and is pending admin review.`,
      "/customer/claims"
    );

    return {
      claim: await ClaimModel.findById(claim.id),
      message: "Claim submitted successfully. It is now pending admin review.",
    };
  }

  static async getMyClaims(userId) {
    return ClaimModel.findByUserId(userId);
  }

  static async adminOverride(claimId, decision) {
    if (!["approved", "rejected"].includes(decision)) {
      throw new Error("Decision must be 'approved' or 'rejected'.");
    }

    const claim = await ClaimModel.findById(claimId);

    if (!claim) {
      throw new Error("Claim not found.");
    }

    const wasApproved = claim.status === "approved";
    await ClaimModel.updateStatus(claimId, { status: decision, reason: "Manually reviewed by admin." });

    if (decision === "approved" && !wasApproved) {
      await UserPlanModel.incrementCoverageUsed(claim.user_plan_id, claim.amount);
    }

    await NotificationService.notifyCustomer(
      claim.user_id,
      decision === "approved" ? "Claim approved" : "Claim rejected",
      `An admin reviewed your ${claim.type} claim and marked it as ${decision}.`,
      "/customer/claims"
    );

    return ClaimModel.findById(claimId);
  }
}

export default ClaimService;
