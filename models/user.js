const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  githubId: String,
  displayName: String,
  boards: [{ type: Schema.Types.ObjectId, ref: "Board" }],
});

mongoose.model("User", userSchema);
