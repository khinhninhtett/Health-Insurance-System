import UserModel from "../models/userModel.js";
import CobolService from "./cobolService.js";
import NotificationService from "./notificationService.js";

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

class UserService {
  static async submitVerification(userId, { nrcFrontPhotoPath, nrcBackPhotoPath, profilePhotoPath, dateOfBirth, address }) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const age = Number.isNaN(new Date(dateOfBirth).getTime()) ? 0 : calculateAge(dateOfBirth);

    const cobolFeedback = await CobolService.execute("verify_profile", [
      user.nrc,
      "Y",
      "Y",
      "Y",
      address && address.trim() ? "Y" : "N",
      String(age),
    ]);

    if (cobolFeedback.status !== "VERIFIED") {
      throw new Error(
        cobolFeedback.message || "COBOL identity verification rejected the submission."
      );
    }

    // The COBOL check only validates the submission itself; an admin must
    // review the documents before the account becomes verified.
    const updated = await UserModel.updateVerification(userId, {
      nrcFrontPhotoPath,
      nrcBackPhotoPath,
      profilePhotoPath,
      dateOfBirth,
      address,
      verificationStatus: "pending",
    });

    await NotificationService.notifyAdmins(
      "Identity verification awaiting review",
      `${user.name} submitted identity documents. Please review and approve or reject them.`,
      "/admin/customers"
    );

    return updated;
  }

  static async decideIdentity(userId, decision) {
    if (!["verified", "rejected"].includes(decision)) {
      throw new Error("Decision must be 'verified' or 'rejected'.");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const updated = await UserModel.setVerificationStatus(userId, decision);

    await NotificationService.notifyCustomer(
      userId,
      decision === "verified" ? "Identity verified" : "Identity verification rejected",
      decision === "verified"
        ? "Your identity has been verified by an admin. You can now purchase insurance."
        : "Your identity documents were rejected. Please resubmit clearer photos.",
      decision === "verified" ? "/customer/plans" : "/customer/verify-profile"
    );

    return updated;
  }
}

export default UserService;
