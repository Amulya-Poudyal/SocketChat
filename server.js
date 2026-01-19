import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { authRouter } from "./routes/authRoutes.js";
import Message from "./models/message.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- AUTH ROUTES ----------------
app.use(authRouter);

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === "auth") {
            ws.username = data.payload.username;

            const messages = await Message.find().sort({ timestamp: 1 });
            ws.send(JSON.stringify({
                type: "history",
                payload: messages.map(m => ({
                    username: m.username,
                    text: m.text,
                    timestamp: new Date(m.timestamp).toLocaleTimeString()
                }))
            }));
            return;
        }

        if (data.type === "chat") {
            const messageObject = {
                username: ws.username,
                text: data.payload.text,
                timestamp: new Date()
            };

            const newMessage = new Message(messageObject);
            await newMessage.save();

            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(JSON.stringify({
                        type: "chat",
                        payload: {
                            username: messageObject.username,
                            text: messageObject.text,
                            timestamp: new Date(messageObject.timestamp).toLocaleTimeString()
                        }
                    }));
                }
            });
        }
    });

    ws.on("close", () => {
        if (ws.username) console.log(`${ws.username} disconnected`);
    });
});

app.listen(3000, () => {
    console.log("HTTP server running on port 3000");
});
