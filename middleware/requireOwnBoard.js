const mongoose = require("mongoose");
const Board = mongoose.model("Board");

module.exports = async (req, res, next) => {
  if (req.params.boardId) {
    console.log("MIDDLEWARE requireOwnBoard, params:", req.params.boardId);

    const match = req.user.boards.filter(
      (board) => board._id == req.params.boardId
    );
    match.length == 0
      ? res.status(401).send({ error: "this is not your board" })
      : next();
  } else {
    next();
  }
};
