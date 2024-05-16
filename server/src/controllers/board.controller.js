const mongoose = require("mongoose");
const Board = mongoose.model("Board");
const User = mongoose.model("User");
const _ = require("lodash");

// Extracted functions for repeated logic
const getBoardById = async (boardId) => {
  return await Board.findById(boardId);
};

const getListById = async (boardId, listId) => {
  const board = await getBoardById(boardId);
  return await board.lists.id(listId);
};

// Business logic for boards
const createBoard = async (name, user) => {
  const board = await new Board({ name });
  const dbUser = await User.findOne({ _id: user._id });

  board.user = dbUser;
  dbUser.boards.push(board._id);

  await board.save();
  await dbUser.save();
  return board;
};

const getBoards = async (user, deleted = false) => {
  const userBoards = await User.findOne({ _id: user._id })
    .populate({
      path: "boards",
      select: "_id name about user",
      match: { $or: [{ deleted: deleted }] },
    })
    .exec();
  return userBoards.boards || [];
};

const getBoard = async (boardId) => {
  return await getBoardById(boardId);
};

const editBoard = async (boardId, update) => {
  return await Board.findOneAndUpdate({ _id: boardId }, update, { new: true });
};

const deleteBoard = async (boardId) => {
  const board = await getBoardById(boardId);
  board.deleted = true;
  board.deletedOn = Date.now();
  await board.save();
  return board;
};

const destroyBoard = async (boardId) => {
  return await Board.findOneAndDelete({ _id: boardId });
};

const shiftLists = async (boardId, sourceIndex, destinationIndex) => {
  const board = await getBoardById(boardId);
  const list = board.lists.splice(sourceIndex, 1)[0];
  board.lists.splice(destinationIndex, 0, list);
  await board.save();
  return board;
};

// Business logic for lists
const createList = async (boardId, name) => {
  const board = await getBoardById(boardId);
  board.lists.push({ name });
  await board.save();
  return board.lists.pop();
};

const editList = async (boardId, listId, update) => {
  const list = await getListById(boardId, listId);
  if (update.name) list.name = update.name;
  await list.save();
  return list;
};

const shiftTasks = async (
  boardId,
  sourceListId,
  sourceIndex,
  destinationListId,
  destinationIndex
) => {
  const board = await getBoardById(boardId);
  const sourceListIndex = board.lists.findIndex(
    (list) => list._id == sourceListId
  );
  const destinationListIndex = board.lists.findIndex(
    (list) => list._id == destinationListId
  );
  const task = board.lists[sourceListIndex].tasks.splice(sourceIndex, 1);
  board.lists[destinationListIndex].tasks.splice(destinationIndex, 0, task[0]);
  await board.save();
  return board;
};

const deleteList = async (boardId, listId) => {
  const board = await getBoardById(boardId);
  const index = board.lists.findIndex((list) => list._id == listId);
  board.lists.splice(index, 1);
  await board.save();
  return listId;
};

// Business logic for tasks
const createTask = async (boardId, listId, task) => {
  const board = await getBoardById(boardId);
  const list = await board.lists.id(listId);

  // push new task increment counter
  list.tasks.push(task);
  await board.save();
  return { task: list.tasks.pop(), listId };
};

const editTask = async (boardId, listId, taskId, update) => {
  const board = await getBoardById(boardId);
  const list = await getListById(boardId, listId);
  const taskIndex = list.tasks.findIndex((task) => task._id == taskId);
  if (update.name) list.tasks[taskIndex].name = update.name;
  if (update.content) list.tasks[taskIndex].content = update.content;
  if (update.color) list.tasks[taskIndex].color = update.color;
  await board.save();
  return { task: list.tasks[taskIndex], listId };
};

const deleteTask = async (boardId, listId, taskId) => {
  const board = await getBoardById(boardId);
  const list = await getListById(boardId, listId);
  const taskIndex = list.tasks.findIndex((task) => task._id == taskId);
  const task = list.tasks[taskIndex];
  list.tasks.splice(taskIndex, 1);
  await board.save();
  return { task, listId };
};

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  editBoard,
  deleteBoard,
  destroyBoard,
  shiftLists,
  createList,
  editList,
  shiftTasks,
  deleteList,
  createTask,
  editTask,
  deleteTask,
};
