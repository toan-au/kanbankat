import mongoose, { UpdateQuery } from "mongoose";
const Board = mongoose.model("Board");
const User = mongoose.model("User");
import _ from "lodash";

// Extracted functions for repeated logic
const getBoardById = async (boardId: string) => {
  return await Board.findById(boardId);
};

const getListById = async (boardId: string, listId: string) => {
  const board = await getBoardById(boardId);
  return await board.lists.id(listId);
};

// Business logic for boards
const createBoard = async (name: string, userId: string) => {
  const board = await new Board({ name });
  const dbUser = await User.findOne({ _id: userId });

  board.user = dbUser;
  dbUser.boards.push(board._id);

  await board.save();
  await dbUser.save();
  return board;
};

const getBoards = async (userId: string, deleted = false) => {
  const userBoards = await User.findOne({ _id: userId })
    .populate({
      path: "boards",
      select: "_id name about user",
      match: { $or: [{ deleted: deleted }] },
    })
    .exec();
  return userBoards.boards || [];
};

const getBoard = async (boardId: string) => {
  const board = await Board.findById(boardId);
  return board;
};

interface BoardUpdate {
  name: string;
  deleted: string;
}

const editBoard = async (boardId: string, update: UpdateQuery<BoardUpdate>) => {
  return await Board.findOneAndUpdate({ _id: boardId }, update, { new: true });
};

const deleteBoard = async (boardId: string) => {
  const board = await getBoardById(boardId);
  board.deleted = true;
  board.deletedOn = Date.now();
  await board.save();
  return board;
};

const destroyBoard = async (boardId: string) => {
  return await Board.findOneAndDelete({ _id: boardId });
};

const shiftLists = async (
  boardId: string,
  sourceIndex: number,
  destinationIndex: number
) => {
  const board = await getBoardById(boardId);
  const list = board.lists.splice(sourceIndex, 1)[0];
  board.lists.splice(destinationIndex, 0, list);
  await board.save();
  return board;
};

// Business logic for lists
const createList = async (boardId: string, name: string) => {
  const board = await getBoardById(boardId);
  board.lists.push({ name });
  await board.save();
  return board.lists.pop();
};

const editList = async (boardId: string, listId: string, update) => {
  const list = await getListById(boardId, listId);
  if (update.name) list.name = update.name;
  await list.save();
  return list;
};

const shiftTasks = async (
  boardId: string,
  sourceListId: number,
  sourceIndex: number,
  destinationListId: number,
  destinationIndex: number
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

const deleteList = async (boardId: string, listId: string) => {
  const board = await getBoardById(boardId);
  const index = board.lists.findIndex((list) => list._id == listId);
  board.lists.splice(index, 1);
  await board.save();
  return listId;
};

// Business logic for tasks
const createTask = async (boardId: string, listId: string, task: Object) => {
  const board = await getBoardById(boardId);
  const list = await board.lists.id(listId);

  // push new task increment counter
  list.tasks.push(task);
  await board.save();
  return { task: list.tasks.pop(), listId };
};

const editTask = async (
  boardId: string,
  listId: string,
  taskId: string,
  update
) => {
  const board = await getBoardById(boardId);
  const list = await getListById(boardId, listId);
  const taskIndex = list.tasks.findIndex((task) => task._id == taskId);
  if (update.name) list.tasks[taskIndex].name = update.name;
  if (update.content) list.tasks[taskIndex].content = update.content;
  if (update.color) list.tasks[taskIndex].color = update.color;
  await board.save();
  return { task: list.tasks[taskIndex], listId };
};

const deleteTask = async (boardId: string, listId: string, taskId: string) => {
  const board = await getBoardById(boardId);
  const list = await getListById(boardId, listId);
  const taskIndex = list.tasks.findIndex((task) => task._id == taskId);
  const task = list.tasks[taskIndex];
  list.tasks.splice(taskIndex, 1);
  await board.save();
  return { task, listId };
};

export default {
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
