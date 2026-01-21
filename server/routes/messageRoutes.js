import express from "express";
import Message from "../models/message.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get last 50 messages
router.get("/history", verifyToken, async (req, res) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ message: "Failed to load history" });
    }
});

export default router;
