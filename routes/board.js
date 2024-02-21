const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const requireOwnBoard = require("../middleware/requireOwnBoard");

const Board = mongoose.model("Board");
const User = mongoose.model("User");

module.exports = (app) => {
  app.get("/api/test", (req, res) => res.send({ test: true }));
  // *************
  // BOARD STUFF
  // *************

  // create a new board
  app.post("/api/board", requireLogin, async (req, res) => {
    const { name } = req.body;
    const board = await new Board({ name });
    const user = await User.findOne({ _id: req.user._id });

    board.user = req.user;
    board.save();
    user.boards.push(board);
    user.save();

    // attach board to user then persist to DB

    res.send(board);
  });

  // get list of user's boards
  app.get("/api/boards", requireLogin, requireOwnBoard, async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
      .populate({ path: "boards", select: "-lists -__v" })
      .exec();
    res.send(user.boards);
  });

  // get a specific board
  app.get(
    "/api/board/:boardId",
    requireLogin,
    requireOwnBoard,
    async (req, res) => {
      const board = await Board.findById(req.params.boardId);
      res.send(board);
    }
  );

  // delete a board
  app.delete(
    "/api/board/:boardId",
    requireLogin,
    requireOwnBoard,
    async (req, res) => {
      await Board.findByIdAndDelete(req.params.boardId);

      // remove id from boardIds
      req.user.boards = req.user.boards.filter(
        (x) => x.id != req.params.boardId
      );

      const user = await req.user.save();
      res.send(user);
    }
  );

  // shifting lists within board
  app.patch("/api/board/:boardId/shift", requireLogin, async (req, res) => {
    let board = await Board.findById(req.params.boardId);
    board.lists = req.body;
    board = await board.save();
    res.send(board);
  });

  // *************
  // LIST STUFF
  // *************

  // create a new list
  app.post("/api/board/list/:boardId/", async (req, res) => {
    const { name } = req.body;
    let board = await Board.findById(req.params.boardId);

    // add a list then subtract 1 from numLists
    board.lists.push({ name });
    board = await board.save();
    res.send(board);
  });

  // shifting tasks within lists
  app.patch("/api/board/list/:boardId/", requireLogin, async (req, res) => {
    const { newerLists } = req.body;
    const board = await Board.findById(req.params.boardId);
    board.lists = [...newerLists];
    await board.save();
    res.send(board);
  });

  // delete a list
  app.delete("/api/board/list/:boardId/:listId", async (req, res) => {
    const { boardId, listId } = req.params;
    let board = await Board.findById(boardId);

    // remove list then subtract form numLists
    board.lists.id(listId).remove();
    board = await board.save();
    res.send(board);
  });

  // *************
  // TASK STUFF
  // *************

  // create a new task
  app.post("/api/board/task/:boardId/:listId", async (req, res) => {
    const { _id, description, color } = req.body;
    const { boardId, listId } = req.params;
    let board = await Board.findById(boardId);
    const list = await board.lists.id(listId);

    // push new task increment counter
    list.tasks.push({ _id, description, color });
    board = await board.save();
    res.send(board);
  });

  // delete a task
  app.delete("/api/board/task/:boardId/:listId/:taskId", async (req, res) => {
    const { boardId, listId, taskId } = req.params;
    let board = await Board.findById(boardId);
    const list = board.lists.id(listId);

    // remove a task decrement counter
    list.tasks.id(taskId).remove();
    board = await board.save();
    res.send(board);
  });
};
