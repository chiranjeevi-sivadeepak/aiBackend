import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// GET ALL GROUP MESSAGES
router.get("/group", async (req, res) => {
  try {
    const messages = await Message.find({ room: "group" })
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

export default router;
