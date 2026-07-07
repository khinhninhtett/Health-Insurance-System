import UserPlanModel from "../models/userPlanModel.js";
import ClaimModel from "../models/claimModel.js";
import UserModel from "../models/userModel.js";
import CobolService from "./cobolService.js";
import NotificationService from "./notificationService.js";

class ClaimService {
  static async submit(userId, { type, hospitalName, serviceDate, amount, description }, documentFile) {
    const userPlan = await UserPlanModel.findLatestByUserId(userId);

    if (!userPlan || userPlan.status !== "active") {
      throw new Error("You need an active policy before filing a claim.");
    }

    const coverageRemaining = userPlan.coverage_amount - userPlan.coverage_used;
    const daysActive = userPlan.start_date
      ? Math.floor((Date.now() - new Date(userPlan.start_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const cobolFeedback = await CobolService.execute("process_claim", [
      "Y",
      String(coverageRemaining),
      String(Math.round(amount)),
      String(Math.max(daysActive, 0)),
    ]);

    const status = cobolFeedback.status === "APPROVED" ? "approved" : "rejected";

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

    await ClaimModel.updateStatus(claim.id, { status, reason: cobolFeedback.message });

    if (status === "approved") {
      await UserPlanModel.incrementCoverageUsed(userPlan.id, amount);
    }

    const user = await UserModel.findById(userId);
    await NotificationService.notifyAdmins(
      "New claim submitted",
      `${user?.name || "A customer"} filed a ${type} claim (${status === "approved" ? "auto-approved" : "auto-rejected"} by COBOL).`,
      "/admin/claims"
    );
    await NotificationService.notifyCustomer(
      userId,
      status === "approved" ? "Claim approved" : "Claim rejected",
      `Your ${type} claim was ${status}. ${cobolFeedback.message}`,
      "/customer/claims"
    );

    return { claim: await ClaimModel.findById(claim.id), message: cobolFeedback.message };
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
