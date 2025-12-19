import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/* ===== GET CHAT HISTORY (SESSIONS) ===== */
router.get("/history", async (req, res) => {
  const history = await Message.aggregate([
    {
      $group: {
        _id: "$sessionId",
        // 🟢 Logic: If text is empty, show "Sent a file" in history sidebar
        lastMessage: { $last: "$text" },
        hasFile: { $last: "$file" },
        lastTime: { $last: "$createdAt" },
      },
    },
    { $sort: { lastTime: -1 } },
  ]);

  // Map history to show placeholder if text is empty
  const formattedHistory = history.map(h => ({
    ...h,
    lastMessage: h.lastMessage || (h.hasFile ? "📎 Attachment sent" : "Empty Message")
  }));

  res.json(formattedHistory);
});

/* ===== GET MESSAGES OF ONE SESSION ===== */
router.get("/messages/:sessionId", async (req, res) => {
  const messages = await Message.find({
    sessionId: req.params.sessionId,
  }).sort({ createdAt: 1 });

  res.json(messages);
});

/* ===== DELETE A CHAT SESSION ===== */
router.delete("/history/:sessionId", async (req, res) => {
  await Message.deleteMany({ sessionId: req.params.sessionId });
  res.json({ success: true });
});

export default router;