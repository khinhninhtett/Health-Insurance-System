import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getPlans, selectPlan, getMyPlan } from "../controllers/planController.js";

const router = express.Router();

router.use(protect);

router.get("/", getPlans);
router.post("/select", selectPlan);
router.get("/me", getMyPlan);

export default router;
