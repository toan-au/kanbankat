import mongoose from "mongoose";
import { LabelDocument } from "../types";

const labelSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50, // Set a reasonable max length for label text
  },
  hexColour: {
    type: String,
    required: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Validate hex color format
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
});

const LabelModel = mongoose.model<LabelDocument>("Label", labelSchema);
export default LabelModel;
