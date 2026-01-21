import 'dotenv/config';
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import Message from "./models/message.js";
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { authRouter } from "./routes/authRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import Channel from "./models/channel.js";
import User from "./models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.set('wss', wss);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
// Adding 'extensions' allows users to visit /login instead of /login.html
app.use(express.static(path.join(__dirname, '../public'), {
    extensions: ['html', 'htm']
}));

app.use("/auth", authRouter);
app.use("/messages", messageRouter);
app.use("/user", userRoutes);
app.use("/channels", channelRoutes);

// Fallback: Serve index.html for any unknown GET requests (good for refresh)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

wss.on("connection", async (ws, req) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get("token");

        if (!token) {
            console.log("No token provided, closing connection");
            ws.close(1008, "Token missing");
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        ws.username = decoded.username;
        ws.userId = decoded.id;
        ws.isAdmin = decoded.isAdmin;
        ws.currentChannel = null;

        console.log("WS connected:", ws.username);

    } catch (err) {
        console.error("WS Auth Error Details:", err.message); // Improved log
        ws.close(1008, "Auth failed");
        return;
    }

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === "join") {
                const { channelId } = data.payload;
                ws.currentChannel = channelId;

                // Send chat history for this channel (last 50)
                const messages = await Message.find({ channel: channelId })
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .lean();

                ws.send(JSON.stringify({
                    type: "history",
                    payload: messages.reverse().map(m => ({
                        username: m.sender,
                        text: m.text,
                        timestamp: new Date(m.createdAt).toLocaleTimeString()
                    }))
                }));
                return;
            }

            if (data.type === "typing") {
                const broadcastData = JSON.stringify({
                    type: "typing",
                    payload: {
                        username: ws.username,
                        isTyping: data.payload.isTyping,
                        channelId: ws.currentChannel
                    }
                });

                wss.clients.forEach(client => {
                    if (client.readyState === 1 && client.currentChannel === ws.currentChannel && client !== ws) {
                        client.send(broadcastData);
                    }
                });
                return;
            }

            if (data.type !== "chat") return;
            if (!ws.currentChannel) return;

            const messageObject = {
                sender: ws.username,
                text: data.payload.text,
                channel: ws.currentChannel
            };

            const savedMessage = await new Message(messageObject).save();

            const broadcastData = JSON.stringify({
                type: "chat",
                payload: {
                    username: ws.username,
                    text: savedMessage.text,
                    timestamp: new Date(savedMessage.createdAt).toLocaleTimeString(),
                    channelId: ws.currentChannel
                }
            });

            wss.clients.forEach(client => {
                if (client.readyState === 1 && client.currentChannel === ws.currentChannel) {
                    client.send(broadcastData);
                }
            });
        } catch (err) {
            console.error("Message Processing Error:", err);
        }
    });

    ws.on("close", () => {
        if (ws.username) console.log(`${ws.username} disconnected`);
    });
});

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in .env");
    process.exit(1);
}

mongoose.connect(DATABASE_URL)
    .then(() => {
        console.log("✅ Database connected");
        server.listen(PORT, () => {
            console.log(`🚀 Server started on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Database connection error:", err);
    });
