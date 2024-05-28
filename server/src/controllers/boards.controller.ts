import mongoose, { UpdateQuery } from "mongoose";
import _ from "lodash";
import {
  BoardDocument,
  ListDocument,
  TaskDocument,
  UserDocument,
} from "../types";
import UserModel from "../models/user.model";
import BoardModel from "../models/board.model";

// Business logic for boards
const createBoard = async (name: string, userId: string) => {
  const board = await new BoardModel({ name });
  const dbUser = (await UserModel.findOne({ _id: userId })) as UserDocument;

  board.user = new mongoose.Types.ObjectId(dbUser._id);
  dbUser.boards.push(board);

  await board.save();
  await dbUser.save();
  return board;
};

const getBoards = async (userId: string, deleted = false) => {
  const userBoards = await UserModel.findOne({ _id: userId })
    .populate({
      path: "boards",
      select: "_id name about user",
      match: { $or: [{ deleted: deleted }] },
    })
    .exec();
  return userBoards?.boards || [];
};

const getBoard = async (boardId: string) => {
  const board = await BoardModel.findById(boardId);
  return board;
};

interface BoardUpdate {
  name: string;
  deleted: string;
}

const editBoard = async (boardId: string, update: UpdateQuery<BoardUpdate>) => {
  return await BoardModel.findOneAndUpdate({ _id: boardId }, update, {
    new: true,
  });
};

const deleteBoard = async (boardId: string) => {
  const board = await BoardModel.findById(boardId);
  if (!board) return;

  board.deleted = true;
  board.deletedOn = new Date(Date.now());
  await board.save();
  return board;
};

const destroyBoard = async (boardId: string) => {
  return await BoardModel.findOneAndDelete({ _id: boardId });
};

const shiftLists = async (
  boardId: string,
  sourceIndex: number,
  destinationIndex: number
) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;

  const list = board.lists.splice(sourceIndex, 1)[0];
  board.lists.splice(destinationIndex, 0, list);
  await board.save();
  return board;
};

// Business logic for lists
const createList = async (boardId: string, name: string) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;
  board.lists.push({ name } as ListDocument);
  await board.save();
  return board.lists.pop();
};

const editList = async (
  boardId: string,
  listId: string,
  update: UpdateQuery<ListDocument>
) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;
  const list = await board.lists.find((list) => list._id.toString() == listId);

  if (!list) return null;

  if (update.name) list.name = update.name;
  await list.save();
  return list;
};

const shiftTask = async (
  boardId: string,
  sourceListId: string,
  sourceIndex: number,
  destinationListId: string,
  destinationIndex: number
) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;
  const sourceListIndex = board.lists.findIndex(
    (list: ListDocument) => list._id.toString() == sourceListId
  );
  const destinationListIndex = board.lists.findIndex(
    (list: ListDocument) => list._id.toString() == destinationListId
  );
  const task = board.lists[sourceListIndex].tasks.splice(sourceIndex, 1);
  board.lists[destinationListIndex].tasks.splice(destinationIndex, 0, task[0]);
  await board.save();
  return board;
};

const deleteList = async (boardId: string, listId: string) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;
  const index = board.lists.findIndex(
    (list: ListDocument) => list._id.toString() == listId
  );
  board.lists.splice(index, 1);
  await board.save();
  return listId;
};

// Business logic for tasks
const createTask = async (
  boardId: string,
  listId: string,
  task: TaskDocument
) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;
  const list = await board.lists.id(listId);

  // push new task increment counter
  list?.tasks.push(task);
  await board.save();
  return { task: list?.tasks.pop(), listId };
};

const editTask = async (
  boardId: string,
  listId: string,
  taskId: string,
  update: UpdateQuery<TaskDocument>
) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;
  const list = await board.lists.id(listId);
  const taskIndex = list?.tasks.findIndex(
    (task: TaskDocument) => task._id.toString() == taskId
  );
  if (update.name) list?.tasks[taskIndex].name = update.name;
  if (update.content) list?.tasks[taskIndex].content = update.content;
  if (update.color) list?.tasks[taskIndex].color = update.color;
  await board.save();
  return { task: list?.tasks[taskIndex], listId };
};

const deleteTask = async (boardId: string, listId: string, taskId: string) => {
  const board = (await BoardModel.findById(boardId)) as BoardDocument;
  const list = await board.lists.id(listId);
  const taskIndex = list?.tasks.findIndex(
    (task: TaskDocument) => task._id.toString() == taskId
  );
  const task = list?.tasks[taskIndex];
  list?.tasks.splice(taskIndex, 1);
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
  shiftTask,
  deleteList,
  createTask,
  editTask,
  deleteTask,
};
