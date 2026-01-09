// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { User } from "../models/User.js";

const router = express.Router();
router.use(cookieParser());

// env vars required: JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES = "7d"; // adjust as needed

// Helper to create token and set cookie
function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  // httpOnly cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "name, email and password are required" });

    // basic email normalization
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
    });

    await user.save();

    const token = setAuthCookie(res, { id: user._id.toString(), userId: user.userId, email: user.email });

    // return minimal user info + token (token also in cookie)
    return res.json({
      message: "ok",
      user: { id: user._id, userId: user.userId, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = setAuthCookie(res, { id: user._id.toString(), userId: user.userId, email: user.email });

    return res.json({
      message: "ok",
      user: { id: user._id, userId: user.userId, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "logged out" });
});

// GET /api/auth/me  - returns current user when token present
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("Auth me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
