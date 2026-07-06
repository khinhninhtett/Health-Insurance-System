import express from "express";
import protect from "../middleware/authMiddleware.js";
import { uploadReceipt } from "../middleware/uploadMiddleware.js";
import { submitPayment, getMyPayments } from "../controllers/paymentController.js";

const router = express.Router();

router.use(protect);

router.post("/", uploadReceipt, submitPayment);
router.get("/me", getMyPayments);

export default router;
