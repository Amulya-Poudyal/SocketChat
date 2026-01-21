import Channel from "../models/channel.js";
import Message from "../models/message.js";
import crypto from "crypto";

export const createChannel = async (req, res) => {
    const { name, isPrivate } = req.body;
    const userId = req.user.id;

    try {
        const existingChannel = await Channel.findOne({ name });
        if (existingChannel) return res.status(400).json({ message: "Channel name already exists" });

        const inviteCode = crypto.randomBytes(4).toString('hex');

        const newChannel = new Channel({
            name,
            owner: userId,
            members: [userId],
            isPrivate,
            inviteCode
        });

        await newChannel.save();
        res.json(newChannel);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getChannels = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get channels where user is a member OR channel is public
        const channels = await Channel.find({
            $or: [
                { isPrivate: false },
                { members: userId }
            ]
        });
        res.json(channels);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const joinChannel = async (req, res) => {
    const { inviteCode } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    try {
        const channel = await Channel.findOne({ inviteCode });
        if (!channel) return res.status(404).json({ message: "Invalid invite code" });

        if (!channel.members.includes(userId)) {
            channel.members.push(userId);
            await channel.save();

            // Broadcast to owner and admins
            const wss = req.app.get('wss');
            const ownerId = channel.owner.toString();
            if (wss) {
                const broadcastData = JSON.stringify({
                    type: "system",
                    payload: {
                        text: `${username} has joined the channel.`,
                        channelId: channel._id.toString()
                    }
                });

                wss.clients.forEach(client => {
                    if (client.readyState === 1 && client.currentChannel === channel._id.toString()) {
                        if (client.userId === ownerId || client.isAdmin) {
                            client.send(broadcastData);
                        }
                    }
                });
            }
        }

        res.json({ message: "Joined successfully", channelId: channel._id });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const leaveChannel = async (req, res) => {
    const { channelId } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) return res.status(404).json({ message: "Channel not found" });

        const ownerId = channel.owner.toString();
        channel.members = channel.members.filter(m => m.toString() !== userId);
        await channel.save();

        // Broadcast to owner and admins
        const wss = req.app.get('wss');
        if (wss) {
            const broadcastData = JSON.stringify({
                type: "system",
                payload: {
                    text: `${username} has left the channel.`,
                    channelId: channelId.toString()
                }
            });

            wss.clients.forEach(client => {
                if (client.readyState === 1 && client.currentChannel === channelId.toString()) {
                    if (client.userId === ownerId || client.isAdmin) {
                        client.send(broadcastData);
                    }
                }
            });
        }

        res.json({ message: "Left channel successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getChannelInfo = async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id;

    try {
        const channel = await Channel.findById(channelId).populate('owner', 'username').populate('members', 'username createdAt');
        if (!channel) return res.status(404).json({ message: "Channel not found" });

        const isOwner = channel.owner._id.toString() === userId;

        // Return detailed info if owner, otherwise basic info
        res.json({
            name: channel.name,
            owner: channel.owner.username,
            isOwner,
            memberCount: channel.members.length,
            inviteCode: isOwner ? channel.inviteCode : null,
            members: isOwner ? channel.members : [], // Only owner gets the member list
            createdAt: channel.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllChannelsAdmin = async (req, res) => {
    try {
        if (!req.user.isAdmin) return res.status(403).json({ message: "Unauthorized" });
        const channels = await Channel.find().populate('owner', 'username');
        res.json(channels);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
