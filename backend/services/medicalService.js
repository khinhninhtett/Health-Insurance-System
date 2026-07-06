import UserPlanModel from "../models/userPlanModel.js";
import MedicalVerificationModel from "../models/medicalVerificationModel.js";
import UserModel from "../models/userModel.js";
import CobolService from "./cobolService.js";
import NotificationService from "./notificationService.js";

class MedicalService {
  static async submit(userId, { age, heightCm, weightKg, bloodPressure, heartRate, bloodGroup, hasChronicDisease, smoker }, medicalRecordFile) {
    const userPlan = await UserPlanModel.findLatestByUserId(userId);

    if (!userPlan || userPlan.status !== "pending_medical") {
      throw new Error("Select an insurance plan before submitting medical verification.");
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = Math.round(bmi);

    const cobolFeedback = await CobolService.execute("validate_medical_submission", [
      String(Math.round(age)),
      String(bmiRounded),
      String(Math.round(heartRate)),
      bloodGroup,
      medicalRecordFile ? "Y" : "N",
    ]);

    if (cobolFeedback.status !== "VALID") {
      throw new Error(cobolFeedback.message || "Medical submission is incomplete.");
    }

    const verification = await MedicalVerificationModel.create({
      userPlanId: userPlan.id,
      age,
      heightCm,
      weightKg,
      bmi: Math.round(bmi * 10) / 10,
      bloodPressure,
      heartRate,
      bloodGroup,
      hasChronicDisease,
      smoker,
      medicalRecordPath: medicalRecordFile.filename,
    });

    const user = await UserModel.findById(userId);
    await NotificationService.notifyAdmins(
      "New medical verification submitted",
      `${user?.name || "A customer"} submitted a medical verification for review.`,
      "/admin/medical-verification"
    );

    return verification;
  }

  static async getMyLatest(userId) {
    return MedicalVerificationModel.findLatestByUserId(userId);
  }

  static async adminDecide(verificationId, { decision, note }, adminUserId) {
    if (!["approved", "rejected"].includes(decision)) {
      throw new Error("Decision must be 'approved' or 'rejected'.");
    }

    const verification = await MedicalVerificationModel.findById(verificationId);

    if (!verification) {
      throw new Error("Medical verification not found.");
    }

    const updated = await MedicalVerificationModel.decide(verificationId, {
      status: decision,
      adminNote: note,
      reviewedBy: adminUserId,
    });

    const userPlan = await UserPlanModel.findById(verification.user_plan_id);

    if (decision === "approved") {
      const premium = await CobolService.execute("calculate_premium", [
        String(Math.round(userPlan.base_monthly_premium)),
        String(Math.round(verification.age)),
        String(Math.round(verification.bmi)),
        verification.has_chronic_disease ? "Y" : "N",
        verification.smoker ? "Y" : "N",
      ]);

      if (premium.status === "OK") {
        await UserPlanModel.updatePremium(userPlan.id, {
          monthlyPremium: Number(premium.monthlyPremium),
          annualPremium: Number(premium.annualPremium),
        });
      }
    }

    await UserPlanModel.updateStatus(
      verification.user_plan_id,
      decision === "approved" ? "pending_payment" : "rejected"
    );

    await NotificationService.notifyCustomer(
      userPlan.user_id,
      decision === "approved" ? "Medical verification approved" : "Medical verification rejected",
      decision === "approved"
        ? "Your medical verification was approved. You can now continue to payment."
        : `Your medical verification was rejected.${note ? ` Reason: ${note}` : ""}`,
      "/customer/medical-verification"
    );

    return updated;
  }
}

export default MedicalService;
