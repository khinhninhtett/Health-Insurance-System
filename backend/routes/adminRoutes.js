import express from "express";
import protect from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js";
import {
  getStats,
  getReports,
  getCustomers,
  getCustomerPhotoAdmin,
  decideIdentityVerification,
  getPaymentReceiptAdmin,
  searchAdmin,
  getPlansAdmin,
  createPlan,
  updatePlan,
  archivePlan,
  getMedicalVerifications,
  decideMedicalVerification,
  getMedicalDocumentAdmin,
  getPaymentsAdmin,
  overridePayment,
  getClaimsAdmin,
  overrideClaim,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/stats", getStats);
router.get("/reports", getReports);

router.get("/customers", getCustomers);
router.get("/customers/:id/photo/:type", getCustomerPhotoAdmin);
router.post("/customers/:id/identity-decision", decideIdentityVerification);
router.get("/search", searchAdmin);

router.get("/plans", getPlansAdmin);
router.post("/plans", createPlan);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", archivePlan);

router.get("/medical-verifications", getMedicalVerifications);
router.post("/medical-verifications/:id/decision", decideMedicalVerification);
router.get("/medical-verifications/:id/document", getMedicalDocumentAdmin);

router.get("/payments", getPaymentsAdmin);
router.get("/payments/:id/receipt", getPaymentReceiptAdmin);
router.post("/payments/:id/override", overridePayment);

router.get("/claims", getClaimsAdmin);
router.post("/claims/:id/override", overrideClaim);

export default router;
