import express from "express";
import { createChannel, getChannels, joinChannel, getAllChannelsAdmin, leaveChannel, getChannelInfo } from "../controllers/channelController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createChannel);
router.get("/list", verifyToken, getChannels);
router.post("/join", verifyToken, joinChannel);
router.post("/leave", verifyToken, leaveChannel);
router.get("/info/:channelId", verifyToken, getChannelInfo);
router.get("/admin/all", verifyToken, getAllChannelsAdmin);

export default router;
