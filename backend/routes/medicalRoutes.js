import express from "express";
import protect from "../middleware/authMiddleware.js";
import { uploadMedicalRecord } from "../middleware/uploadMiddleware.js";
import { submitMedicalVerification, getMyMedicalVerification, getMyMedicalDocument } from "../controllers/medicalController.js";

const router = express.Router();

router.use(protect);

router.post("/", uploadMedicalRecord, submitMedicalVerification);
router.get("/me", getMyMedicalVerification);
router.get("/document", getMyMedicalDocument);

export default router;
