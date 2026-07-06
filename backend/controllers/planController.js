import PlanModel from "../models/planModel.js";
import PlanService from "../services/planService.js";

export const getPlans = async (req, res) => {
  try {
    const plans = await PlanModel.findAllActive();
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const selectPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userPlan = await PlanService.selectPlan(req.user.id, planId);
    res.status(201).json({ success: true, userPlan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyPlan = async (req, res) => {
  try {
    const userPlan = await PlanService.getMyPlan(req.user.id);
    res.status(200).json({ success: true, userPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
