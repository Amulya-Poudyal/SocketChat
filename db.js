import mongoose from "mongoose";

const uri = "mongodb://127.0.0.1:27017/chat-app";

mongoose.connect(uri)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

export default mongoose;
