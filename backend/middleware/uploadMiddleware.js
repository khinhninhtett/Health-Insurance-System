import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsDir = path.resolve(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const FIELD_LABELS = {
  nrcFrontPhoto: "nrcfront",
  nrcBackPhoto: "nrcback",
  profilePhoto: "profile",
  medicalRecord: "medical",
  receipt: "receipt",
  document: "claimdoc",
};

const PDF_FIELDS = new Set(["medicalRecord"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const label = FIELD_LABELS[file.fieldname] || file.fieldname;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}_${label}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (PDF_FIELDS.has(file.fieldname)) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed for the medical record."));
    }
    return cb(null, true);
  }

  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadVerificationPhotos = upload.fields([
  { name: "nrcFrontPhoto", maxCount: 1 },
  { name: "nrcBackPhoto", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]);

export const uploadMedicalRecord = upload.fields([{ name: "medicalRecord", maxCount: 1 }]);
export const uploadReceipt = upload.fields([{ name: "receipt", maxCount: 1 }]);
export const uploadClaimDocument = upload.fields([{ name: "document", maxCount: 1 }]);
