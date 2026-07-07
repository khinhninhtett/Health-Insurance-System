import express from "express";
import protect from "../middleware/authMiddleware.js";
import { uploadVerificationPhotos } from "../middleware/uploadMiddleware.js";
import { getMe, submitVerification, getPhoto } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMe);
router.post("/verify", uploadVerificationPhotos, submitVerification);
router.get("/me/photo/:type", getPhoto);

export default router;
