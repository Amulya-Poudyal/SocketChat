import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username })
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            username: user.username,
            createdAt: user.createdAt,
            isAdmin: user.isAdmin
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
