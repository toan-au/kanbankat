const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const requireOwnBoard = require("../middleware/requireOwnBoard");
const _ = require("lodash");

const Board = mongoose.model("Board");
const User = mongoose.model("User");
module.exports = (app) => {
  function asyncHandler(routeHandler) {
    return async (req, res, next) => {
      return Promise.resolve(routeHandler(req, res, next)).catch(next);
    };
  }

  app.get("/api/test", (req, res) => res.send({ test: true }));
  // *************
  // BOARD STUFF
  // *************

  // create a new board
  app.post(
    "/api/board",
    requireLogin,
    asyncHandler(async (req, res) => {
      const { name } = req.body;
      const board = await new Board({ name });
      const user = await User.findOne({ _id: req.user._id });

      board.user = req.user;
      user.boards.push(board);
      await board.save();
      await user.save();

      // attach board to user then persist to DB

      res.send(board);
    })
  );

  // get list of user's boards
  app.get(
    "/api/boards",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      console.log("user id: ", req.user._id);
      const user = await User.findOne({ _id: req.user._id })
        .populate({
          path: "boards",
          select: "_id name about user",
          match: { $or: [{ deleted: false }, { deleted: null }] },
        })
        .exec();
      console.log("user.boards: ", user.boards);
      const response = user.boards || [];
      res.send(response);
    })
  );

  // get a specific board
  app.get(
    "/api/board/:boardId",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const board = await Board.findById(req.params.boardId);
      res.send(board);
    })
  );

  // edit a board
  app.patch(
    "/api/board/:boardId",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const update = {
        name: req.body.name,
      };
      const board = await Board.findOneAndUpdate(
        { _id: req.params.boardId },
        update,
        { new: true }
      );
      res.send(board);
    })
  );

  // delete a board
  app.delete(
    "/api/board/:boardId",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const board = await Board.findById(req.params.boardId);
      board.deleted = true;
      board.deletedOn = Date.now();
      board.save();
      console.log(board);
      res.send(board);
    })
  );

  // shifting lists within board
  app.patch(
    "/api/board/:boardId/lists",
    requireLogin,
    asyncHandler(async (req, res) => {
      const { boardId, sourceIndex, destinationIndex } = req.body;
      let board = await Board.findById(boardId);
      const list = board.lists.splice(sourceIndex, 1)[0];
      board.lists.splice(destinationIndex, 0, list);
      board.save();
      res.send(boardId, sourceIndex, destinationIndex);
    })
  );

  // *************
  // LIST STUFF
  // *************

  // create a new list
  app.post(
    "/api/board/:boardId/list/",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const { name } = req.body;
      let board = await Board.findById(req.params.boardId);

      // add a list then subtract 1 from numLists
      board.lists.push({ name });
      board = await board.save();
      const list = board.lists.pop();
      console.log(list);
      res.send(list);
    })
  );

  // Edit list
  app.patch(
    "/api/board/:boardId/list/:listId/",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const { boardId, listId } = req.params;

      // Find the list
      const board = await Board.findById(boardId);
      const index = board.lists.findIndex((list) => list._id == listId);

      console.log(board.lists[index]);

      // safe properties
      const safeParams = _.pick(req.body, ["name", "tasks"]);

      // Update the list
      if (safeParams.name) board.lists[index].name = safeParams.name;
      console.log(board.lists[index]);

      board.save();
      res.send(board.lists[index]);
    })
  );

  // shifting tasks within lists
  app.patch(
    "/api/board/:boardId/lists/tasks",
    requireLogin,
    asyncHandler(async (req, res) => {
      const {
        boardId,
        sourceListId,
        sourceIndex,
        destinationListId,
        destinationIndex,
      } = req.body;
      const board = await Board.findById(req.params.boardId);

      // Find source and destination lsits
      const sourceListIndex = board.lists.findIndex(
        (list) => list._id == sourceListId
      );
      const destinationListIndex = board.lists.findIndex(
        (list) => list._id == destinationListId
      );

      // splice task from source
      const task = board.lists[sourceListIndex].tasks.splice(sourceIndex, 1);

      // insert into destination
      board.lists[destinationListIndex].tasks.splice(
        destinationIndex,
        0,
        task[0]
      );

      await board.save();
      res.send({
        boardId,
        sourceListId,
        sourceIndex,
        destinationListId,
        destinationIndex,
      });
    })
  );

  // delete a list
  app.delete(
    "/api/board/:boardId/list/:listId",
    asyncHandler(async (req, res) => {
      const { boardId, listId } = req.params;
      console.log(req.params);
      const board = await Board.findById(boardId);
      console.log(board.lists);

      const index = board.lists.findIndex((list) => list._id == listId);
      console.log("index to delete", index);

      board.lists.splice(index, 1);
      await board.save();

      res.send(listId);
    })
  );

  // *************
  // TASK STUFF
  // *************

  // create a new task
  app.post(
    "/api/board/:boardId/list/:listId/task",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const { _id, name, content, color } = req.body;
      console.log(
        `POST /api/board/:boardId/list/:listId/task params`,
        req.body
      );
      const { boardId, listId } = req.params;
      let board = await Board.findById(boardId);
      const list = await board.lists.id(listId);

      // push new task increment counter
      list.tasks.push({ _id, name, content, color });
      board = await board.save();
      res.send({ task: list.tasks.pop(), listId });
    })
  );

  // Edit task
  app.patch(
    "/api/board/:boardId/list/:listId/task/:taskId",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const { name, content, color } = req.body;
      console.log(
        `PATCH /api/board/:boardId/list/:listId/task params`,
        req.params,
        "body: ",
        req.body
      );

      const { boardId, listId, taskId } = req.params;
      console.log(`Searching Board by ID: ${boardId}`);
      let board = await Board.findById(boardId);
      console.log(board);

      console.log(`Searching board's list by ID: ${listId}`);
      const list = await board.lists.id(listId);
      console.log(list);

      // push new task increment counter
      console.log(`Searching list's task by ID: ${taskId}`);
      const taskIndex = list.tasks.findIndex((task) => task._id == taskId);
      console.log(list.tasks[taskIndex]);
      console.log("updating task...");
      if (name) list.tasks[taskIndex].name = name;
      if (content) list.tasks[taskIndex].content = content;
      if (color) list.tasks[taskIndex].color = color;
      console.log(list.tasks[taskIndex]);
      board = await board.save();

      res.send({ task: list.tasks[taskIndex], listId });
    })
  );

  // delete a task
  app.delete(
    "/api/board/:boardId/list/:listId/task/:taskId",
    requireLogin,
    requireOwnBoard,
    asyncHandler(async (req, res) => {
      const { boardId, listId, taskId } = req.params;
      console.log(
        "/api/board/:boardId/list/:listId/task/:taskId",
        boardId,
        listId,
        taskId
      );

      // Find board
      console.log(`Searching Board by ID: ${boardId}`);
      let board = await Board.findById(boardId);
      console.log(board);

      console.log(`Searching board's list by ID: ${listId}`);
      const listIndex = board.lists.findIndex((list) => list._id == listId);
      console.log(`Found list at index: ${listIndex}`);
      const list = board.lists[listIndex];
      console.log(list);

      // Find list
      console.log(`Searching list's task by ID: ${taskId}`);
      const taskIndex = list.tasks.findIndex((task) => task._id == taskId);
      console.log(`Found task at index: ${taskIndex}`);

      const task = list.tasks[taskIndex];
      console.log(task);

      // Delete task
      list.tasks.splice(taskIndex, 1);
      board.save();

      const response = { task, listId };
      res.send(response);
    })
  );
};
