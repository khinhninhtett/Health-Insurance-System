import UserModel from "../models/userModel.js";
import CobolService from "./cobolService.js";

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

    return UserModel.updateVerification(userId, {
      nrcFrontPhotoPath,
      nrcBackPhotoPath,
      profilePhotoPath,
      dateOfBirth,
      address,
      verificationStatus: "verified",
    });
  }
}

export default UserService;
