import express from "express";
import { registerUser, loginUser, promoteToAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/promote-admin/:username", promoteToAdmin);

export { router as authRouter };
