const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boardRepSchema = new Schema({
  id: String,
  name: String,
});

const userSchema = new Schema({
  googleId: String,
  displayName: String,
  boards: [{ type: Schema.Types.ObjectId, ref: "Board" }],
});

mongoose.model("User", userSchema);
