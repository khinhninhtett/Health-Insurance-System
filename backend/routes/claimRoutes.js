import express from "express";
import protect from "../middleware/authMiddleware.js";
import { uploadClaimDocument } from "../middleware/uploadMiddleware.js";
import { submitClaim, getMyClaims } from "../controllers/claimController.js";

const router = express.Router();

router.use(protect);

router.post("/", uploadClaimDocument, submitClaim);
router.get("/me", getMyClaims);

export default router;
