import path from "path";
import fs from "fs";
import UserModel from "../models/userModel.js";
import PlanModel from "../models/planModel.js";
import SearchModel from "../models/searchModel.js";
import MedicalVerificationModel from "../models/medicalVerificationModel.js";
import PaymentModel from "../models/paymentModel.js";
import ClaimModel from "../models/claimModel.js";
import ReportModel from "../models/reportModel.js";
import MedicalService from "../services/medicalService.js";
import PaymentService from "../services/paymentService.js";
import ClaimService from "../services/claimService.js";
import { uploadsDir } from "../middleware/uploadMiddleware.js";

// Dashboard / reports
export const getStats = async (req, res) => {
  try {
    res.status(200).json({ success: true, stats: await ReportModel.getStats() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const [revenueData, customerGrowthData, planDistributionData] = await Promise.all([
      ReportModel.getRevenueByMonth(),
      ReportModel.getCustomerGrowthByMonth(),
      ReportModel.getPlanDistribution(),
    ]);
    res.status(200).json({ success: true, revenueData, customerGrowthData, planDistributionData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await UserModel.findAllCustomersForAdmin();
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const CUSTOMER_PHOTO_COLUMNS = {
  nrcFront: "nrc_front_photo_path",
  nrcBack: "nrc_back_photo_path",
  profile: "profile_photo_path",
};

export const getCustomerPhotoAdmin = async (req, res) => {
  try {
    const column = CUSTOMER_PHOTO_COLUMNS[req.params.type];

    if (!column) {
      return res.status(400).json({ success: false, message: "Invalid photo type." });
    }

    const user = await UserModel.findById(req.params.id);
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

// Plans CRUD
export const getPlansAdmin = async (req, res) => {
  try {
    res.status(200).json({ success: true, plans: await PlanModel.findAllForAdmin() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await PlanModel.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await PlanModel.update(req.params.id, req.body);
    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const archivePlan = async (req, res) => {
  try {
    await PlanModel.archive(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Global search (customers, plans, payments, claims)
export const searchAdmin = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();

    if (!query) {
      return res.status(200).json({ success: true, results: { customers: [], plans: [], payments: [], claims: [] } });
    }

    const results = await SearchModel.searchAll(query);
    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Medical verification review
export const getMedicalVerifications = async (req, res) => {
  try {
    const verifications = await MedicalVerificationModel.findAllForAdmin(req.query.status);
    res.status(200).json({ success: true, verifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const decideMedicalVerification = async (req, res) => {
  try {
    const { decision, note } = req.body;
    const verification = await MedicalService.adminDecide(req.params.id, { decision, note }, req.user.id);
    res.status(200).json({ success: true, verification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMedicalDocumentAdmin = async (req, res) => {
  try {
    const verification = await MedicalVerificationModel.findById(req.params.id);

    if (!verification?.medical_record_path) {
      return res.status(404).json({ success: false, message: "Medical record not found." });
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

// Payments oversight
export const getPaymentsAdmin = async (req, res) => {
  try {
    res.status(200).json({ success: true, payments: await PaymentModel.findAllForAdmin() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const overridePayment = async (req, res) => {
  try {
    const payment = await PaymentService.adminOverride(req.params.id, req.body.decision);
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Claims oversight
export const getClaimsAdmin = async (req, res) => {
  try {
    res.status(200).json({ success: true, claims: await ClaimModel.findAllForAdmin() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const overrideClaim = async (req, res) => {
  try {
    const claim = await ClaimService.adminOverride(req.params.id, req.body.decision);
    res.status(200).json({ success: true, claim });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
