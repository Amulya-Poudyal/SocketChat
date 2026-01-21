import Channel from "../models/channel.js";
import crypto from "crypto";

/**
 * Get or create the default #general channel
 * @returns {Promise<Channel>} The general channel
 */
export const getOrCreateGeneralChannel = async () => {
    try {
        let generalChannel = await Channel.findOne({ name: "general" });

        if (!generalChannel) {
            // Create the general channel without an owner (system channel)
            const inviteCode = crypto.randomBytes(4).toString('hex');
            generalChannel = new Channel({
                name: "general",
                owner: null, // System channel, no specific owner
                members: [],
                isPrivate: false,
                inviteCode
            });
            await generalChannel.save();
            console.log("✅ Default #general channel created");
        }

        return generalChannel;
    } catch (err) {
        console.error("Error creating/fetching general channel:", err);
        throw err;
    }
};

/**
 * Add a user to the general channel
 * @param {string} userId - The user's ID
 */
export const addUserToGeneralChannel = async (userId) => {
    try {
        const generalChannel = await getOrCreateGeneralChannel();

        if (!generalChannel.members.includes(userId)) {
            generalChannel.members.push(userId);
            await generalChannel.save();
            console.log(`✅ User ${userId} added to #general`);
        }
    } catch (err) {
        console.error("Error adding user to general channel:", err);
        // Don't throw - we don't want registration to fail if this fails
    }
};
