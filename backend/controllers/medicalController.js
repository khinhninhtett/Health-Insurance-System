import path from "path";
import fs from "fs";
import MedicalVerificationModel from "../models/medicalVerificationModel.js";
import MedicalService from "../services/medicalService.js";
import { uploadsDir } from "../middleware/uploadMiddleware.js";

export const submitMedicalVerification = async (req, res) => {
  try {
    const medicalRecordFile = req.files?.medicalRecord?.[0];

    if (!medicalRecordFile) {
      return res.status(400).json({ success: false, message: "A medical record PDF is required." });
    }

    const { age, heightCm, weightKg, bloodPressure, heartRate, bloodGroup, hasChronicDisease, smoker } = req.body;

    if (!age || !heightCm || !weightKg || !heartRate || !bloodGroup) {
      return res.status(400).json({ success: false, message: "Missing required medical information." });
    }

    const verification = await MedicalService.submit(
      req.user.id,
      {
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        bloodPressure,
        heartRate: Number(heartRate),
        bloodGroup,
        hasChronicDisease: hasChronicDisease === "true" || hasChronicDisease === true,
        smoker: smoker === "true" || smoker === true,
      },
      medicalRecordFile
    );

    res.status(201).json({ success: true, verification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyMedicalVerification = async (req, res) => {
  try {
    const verification = await MedicalService.getMyLatest(req.user.id);
    res.status(200).json({ success: true, verification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyMedicalDocument = async (req, res) => {
  try {
    const verification = await MedicalVerificationModel.findLatestByUserId(req.user.id);

    if (!verification?.medical_record_path) {
      return res.status(404).json({ success: false, message: "No medical record found." });
    }

    const resolvedPath = path.resolve(uploadsDir, verification.medical_record_path);

    if (!resolvedPath.startsWith(uploadsDir) || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: "Medical record not found." });
    }

    res.sendFile(resolvedPath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
