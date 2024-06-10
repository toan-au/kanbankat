import mongoose from "mongoose";
import Label from "./label.model";
import { UserDocument } from "../types";

const Schema = mongoose.Schema;

const defaultLabels = [
  { text: "Label 1", hexColour: "#2196F3" }, // Blue
  { text: "Label 2", hexColour: "#4CAF50" }, // Green
  { text: "Label 3", hexColour: "#FF9800" }, // Orange
  { text: "Label 4", hexColour: "#F44336" }, // Red
  { text: "Label 5", hexColour: "#9C27B0" }, // Purple
  { text: "Label 6", hexColour: "#673AB7" }, // Deep Purple
];

const userSchema = new Schema({
  googleId: String,
  githubId: String,
  displayName: String,
  boards: [{ type: Schema.Types.ObjectId, ref: "Board" }],
  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
    },
  ],
});

userSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const labels = await Label.insertMany(
        defaultLabels.map((label) => ({ ...label, user: this._id }))
      );

      // Add the label IDs to the user's labels array
      this.labels = labels.map((label) => label._id);
      next();
    }
  } catch (err: any) {
    return next(err);
  }
});

userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await Label.deleteMany({ user: this._id });
    next();
  }
);

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
