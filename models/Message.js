import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    // 🟢 CHANGE: Make text optional so images can be sent alone
    text: {
      type: String,
      required: false, 
      default: ""
    },
    sessionId: {
      type: String,
      required: true,
    },
    // 🟢 NEW: Fields to store file data
    file: {
      type: String, // Base64 string
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;