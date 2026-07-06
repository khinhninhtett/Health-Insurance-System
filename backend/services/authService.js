import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CobolService from "./cobolService.js";

class AuthService {
  static async registerUser(userData) {
    const { name, email, phone, nrc, password, role } = userData;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      throw new Error("Account with this email already exists.");
    }

    // Execute COBOL validation
    const cobolFeedback = await CobolService.execute(
      "user_register",
      [role, nrc]
    );

    if (cobolFeedback.status !== "SUCCESS") {
      throw new Error(
        cobolFeedback.message ||
          "COBOL domain constraint rejected registration."
      );
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const savedUser = await UserModel.create({
      name,
      email,
      phone,
      nrc,
      password: hashedPassword,
      role,
    });

    return savedUser;
  }

  static async loginUser(email, plainPassword) {
    // Find user
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      plainPassword,
      user.password
    );

    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    // COBOL authorization
    const cobolFeedback = await CobolService.execute(
      "user_login",
      [user.role]
    );

    if (cobolFeedback.status !== "ALLOWED") {
      throw new Error(
        cobolFeedback.message ||
          "System gateway clearance denied."
      );
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verification_status,
      },
    };
  }
}

export default AuthService;