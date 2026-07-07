import express from "express";
import protect from "../middleware/authMiddleware.js";
import { calculatePremium } from "../controllers/premiumController.js";

const router = express.Router();

router.use(protect);

router.post("/calculate", calculatePremium);

export default router;
