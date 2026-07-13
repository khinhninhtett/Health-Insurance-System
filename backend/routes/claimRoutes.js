import express from "express";
import protect from "../middleware/authMiddleware.js";
import { uploadClaimDocument } from "../middleware/uploadMiddleware.js";
import { submitClaim, getMyClaims, getClaimTypes } from "../controllers/claimController.js";

const router = express.Router();

router.use(protect);

router.post("/", uploadClaimDocument, submitClaim);
router.get("/me", getMyClaims);
router.get("/types", getClaimTypes);

export default router;
