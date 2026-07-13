import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getPlans, selectPlan, getMyPlan } from "../controllers/planController.js";

const router = express.Router();

// Public: the landing page shows active plans without authentication.
router.get("/", getPlans);

router.use(protect);

router.post("/select", selectPlan);
router.get("/me", getMyPlan);

export default router;
