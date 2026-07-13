import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

import {connectDB}  from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import premiumRoutes from "./routes/premiumRoutes.js";
import medicalRoutes from "./routes/medicalRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ReminderService from "./services/reminderService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

await connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/medical-verification", medicalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
    }

    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }

    next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    ReminderService.start();
});