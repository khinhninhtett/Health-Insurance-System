import path from "path";
import fs from "fs";
import UserModel from "../models/userModel.js";
import UserService from "../services/userService.js";
import { uploadsDir } from "../middleware/uploadMiddleware.js";

const PHOTO_COLUMNS = {
  nrcFront: "nrc_front_photo_path",
  nrcBack: "nrc_back_photo_path",
  profile: "profile_photo_path",
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nrc: user.nrc,
        role: user.role,
        dateOfBirth: user.date_of_birth,
        address: user.address,
        verificationStatus: user.verification_status,
        hasNrcFrontPhoto: !!user.nrc_front_photo_path,
        hasNrcBackPhoto: !!user.nrc_back_photo_path,
        hasProfilePhoto: !!user.profile_photo_path,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitVerification = async (req, res) => {
  try {
    const nrcFrontPhoto = req.files?.nrcFrontPhoto?.[0];
    const nrcBackPhoto = req.files?.nrcBackPhoto?.[0];
    const profilePhoto = req.files?.profilePhoto?.[0];
    const { dateOfBirth, address } = req.body;

    if (!nrcFrontPhoto || !nrcBackPhoto || !profilePhoto) {
      return res.status(400).json({
        success: false,
        message: "NRC front photo, NRC back photo, and a personal photo are all required.",
      });
    }

    if (!dateOfBirth || !address) {
      return res.status(400).json({
        success: false,
        message: "Date of birth and address are required.",
      });
    }

    const updatedUser = await UserService.submitVerification(req.user.id, {
      nrcFrontPhotoPath: nrcFrontPhoto.filename,
      nrcBackPhotoPath: nrcBackPhoto.filename,
      profilePhotoPath: profilePhoto.filename,
      dateOfBirth,
      address,
    });

    res.status(200).json({
      success: true,
      message: "Documents submitted. An admin will review your identity shortly.",
      user: {
        id: updatedUser.id,
        verificationStatus: updatedUser.verification_status,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPhoto = async (req, res) => {
  try {
    const column = PHOTO_COLUMNS[req.params.type];

    if (!column) {
      return res.status(400).json({ success: false, message: "Invalid photo type." });
    }

    const user = await UserModel.findById(req.user.id);
    const filename = user?.[column];

    if (!filename) {
      return res.status(404).json({ success: false, message: "Photo not found." });
    }

    const resolvedPath = path.resolve(uploadsDir, filename);

    if (!resolvedPath.startsWith(uploadsDir) || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: "Photo not found." });
    }

    res.sendFile(resolvedPath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
