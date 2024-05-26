import mongoose from "mongoose";

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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Label = mongoose.model("Label", labelSchema);

export default Label;
