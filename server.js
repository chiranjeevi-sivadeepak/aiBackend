import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import Message from "./models/Message.js";

dotenv.config();
connectDb();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ✅ INCREASE LIMITS: Required for large Base64 images/files
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({ origin: "https://ai-frontend-seven-drab.vercel.app" }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Fetch Group Chat History for persistence
app.get("/api/chat/group-history", async (req, res) => {
  try {
    const messages = await Message.find({ sessionId: "GROUP_CHAT" })
      .sort({ createdAt: 1 })
      .limit(500); 
    res.json(messages);
  } catch (err) {
    console.error("❌ History Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch group history" });
  }
});

const io = new Server(server, {
  cors: { origin: "https://ai-frontend-seven-drab.vercel.app" },
  maxHttpBufferSize: 1e8, // Allow up to 100MB buffer for file transfers
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("register-user", (user) => {
    connectedUsers.set(socket.id, {
      socketId: socket.id,
      username: user.username,
    });
    io.emit("connected-users", Array.from(connectedUsers.values()));
  });

  // ✅ HANDLER: Real-time Messages & File Storage
  socket.on("message", async (msg) => {
    try {
      const session = msg.sessionId || "GROUP_CHAT";

      const savedMessage = await Message.create({
        from: msg.from,
        sessionId: session,
        text: msg.text || "", // Handle empty text messages correctly
        file: msg.file || null, // Base64 data
        fileName: msg.fileName || null,
        fileType: msg.fileType || null,
        time: msg.time || new Date().toISOString()
      });

      // Broadcast the saved document to ALL clients (Live update)
      io.emit("message", savedMessage);
    } catch (err) {
      console.error("❌ Message save failed:", err.message);
      socket.emit("error-message", "Failed to send message. Validation error.");
    }
  });

  socket.on("typing", (data) => socket.broadcast.emit("typing", data));
  socket.on("stop-typing", () => socket.broadcast.emit("stop-typing"));

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    io.emit("connected-users", Array.from(connectedUsers.values()));
  });
});

server.listen(PORT, () => console.log("✅ Server running on https://ai-frontend-seven-drab.vercel.app/"));