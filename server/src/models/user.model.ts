import mongoose from "mongoose";
import { UserDocument } from "../types";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  githubId: String,
  displayName: String,
  boards: [{ type: Schema.Types.ObjectId, ref: "Board" }],
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
