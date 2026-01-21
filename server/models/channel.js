import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true },
}, { timestamps: true });

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;
