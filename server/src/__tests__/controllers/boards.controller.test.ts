import mongoose from "mongoose";
import { ListDocument, TaskDocument } from "../../types";

jest.mock("../../models/board.model");
jest.mock("../../models/user.model");

import BoardModel from "../../models/board.model";
import UserModel from "../../models/user.model";
import boardController from "../../controllers/boards.controller";

const MockedBoardModel = BoardModel as unknown as jest.Mock & {
  findById: jest.Mock;
  findOneAndUpdate: jest.Mock;
  findOneAndDelete: jest.Mock;
};
const MockedUserModel = UserModel as unknown as {
  findOne: jest.Mock;
};

type TestList = ListDocument & { save: jest.Mock };

// Builds a plain-object stand-in for a Mongoose board document. `lists` gets
// a `.id()` helper attached to mimic Mongoose's DocumentArray#id(), since the
// controller relies on it for task lookups.
function makeLists(lists: Partial<ListDocument>[]) {
  const arr = lists.map((list) => ({
    tasks: [],
    save: jest.fn().mockResolvedValue(undefined),
    ...list,
  })) as unknown as TestList[] & { id: (id: string) => TestList | undefined };
  arr.id = (id) => arr.find((list) => list._id.toString() === id);
  return arr;
}

function makeTask(overrides: Partial<TaskDocument> = {}): TaskDocument {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: "Task",
    content: "",
    color: "none",
    ...overrides,
  } as TaskDocument;
}

function makeBoard(overrides: Record<string, unknown> = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: "Test Board",
    lists: makeLists([]),
    deleted: false,
    deletedOn: undefined as Date | undefined,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("boards.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBoard", () => {
    it("assigns the board to the user, saves both, and returns the board", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const dbUser = { _id: userId, boards: [] as unknown[], save: jest.fn().mockResolvedValue(undefined) };
      MockedUserModel.findOne.mockResolvedValue(dbUser);

      const boardInstance = { name: "New Board", save: jest.fn().mockResolvedValue(undefined) };
      MockedBoardModel.mockImplementation(() => boardInstance);

      const result = await boardController.createBoard("New Board", userId);

      expect(MockedUserModel.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(dbUser.boards).toEqual([boardInstance]);
      expect(dbUser.save).toHaveBeenCalledTimes(1);
      expect(boardInstance.save).toHaveBeenCalledTimes(1);
      expect(result.user.toString()).toBe(userId);
    });
  });

  describe("getBoards", () => {
    it("populates boards matching the deleted filter", async () => {
      const exec = jest.fn().mockResolvedValue({ boards: [{ name: "A" }] });
      const populate = jest.fn().mockReturnValue({ exec });
      MockedUserModel.findOne.mockReturnValue({ populate });

      const result = await boardController.getBoards("user-1", true);

      expect(MockedUserModel.findOne).toHaveBeenCalledWith({ _id: "user-1" });
      expect(populate).toHaveBeenCalledWith({
        path: "boards",
        select: "_id name about user",
        match: { $or: [{ deleted: true }] },
      });
      expect(result).toEqual([{ name: "A" }]);
    });

    it("returns an empty array when the user or boards are missing", async () => {
      const exec = jest.fn().mockResolvedValue(null);
      MockedUserModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ exec }) });

      const result = await boardController.getBoards("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("getBoard", () => {
    it("finds the board by id and populates labels", async () => {
      const board = makeBoard();
      const populate = jest.fn().mockResolvedValue(board);
      MockedBoardModel.findById = jest.fn().mockReturnValue({ populate });

      const result = await boardController.getBoard(board._id.toString());

      expect(MockedBoardModel.findById).toHaveBeenCalledWith(board._id.toString());
      expect(populate).toHaveBeenCalledWith("labels");
      expect(result).toBe(board);
    });
  });

  describe("editBoard", () => {
    it("updates and returns the board", async () => {
      const updated = makeBoard({ name: "Renamed" });
      MockedBoardModel.findOneAndUpdate = jest.fn().mockResolvedValue(updated);

      const result = await boardController.editBoard("board-1", {
        name: "Renamed",
        // BoardUpdate.deleted is typed `string` even though callers only ever
        // pass a boolean or leave it undefined — an existing type mismatch,
        // not fixed here.
        deleted: undefined as unknown as string,
      });

      expect(MockedBoardModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "board-1" },
        { name: "Renamed", deleted: undefined },
        { new: true }
      );
      expect(result).toBe(updated);
    });
  });

  describe("deleteBoard", () => {
    it("soft-deletes the board", async () => {
      const board = makeBoard();
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.deleteBoard(board._id.toString());

      expect(board.deleted).toBe(true);
      expect(board.deletedOn).toBeInstanceOf(Date);
      expect(board.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(board);
    });

    it("returns undefined without saving when the board does not exist", async () => {
      MockedBoardModel.findById = jest.fn().mockResolvedValue(null);

      const result = await boardController.deleteBoard("missing");

      expect(result).toBeUndefined();
    });
  });

  describe("destroyBoard", () => {
    it("permanently deletes the board", async () => {
      const board = makeBoard();
      MockedBoardModel.findOneAndDelete = jest.fn().mockResolvedValue(board);

      const result = await boardController.destroyBoard(board._id.toString());

      expect(MockedBoardModel.findOneAndDelete).toHaveBeenCalledWith({ _id: board._id.toString() });
      expect(result).toBe(board);
    });
  });

  describe("shiftLists", () => {
    it("reorders lists from sourceIndex to destinationIndex", async () => {
      const listA = { _id: new mongoose.Types.ObjectId() };
      const listB = { _id: new mongoose.Types.ObjectId() };
      const listC = { _id: new mongoose.Types.ObjectId() };
      const board = makeBoard({ lists: makeLists([listA, listB, listC]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.shiftLists(board._id.toString(), 0, 2);

      expect(result.lists.map((l) => l._id)).toEqual([listB._id, listC._id, listA._id]);
      expect(board.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("createList", () => {
    it("pushes a new list and returns it", async () => {
      const board = makeBoard({ lists: makeLists([]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.createList(board._id.toString(), "New List");

      expect(result).toMatchObject({ name: "New List" });
      expect(board.lists).toHaveLength(0); // popped off after push, per existing behavior
      expect(board.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("editList", () => {
    it("updates the list name when found", async () => {
      const list = { _id: new mongoose.Types.ObjectId(), name: "Old" };
      const board = makeBoard({ lists: makeLists([list]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.editList(
        board._id.toString(),
        list._id.toString(),
        { name: "New" }
      );

      expect(result?.name).toBe("New");
      expect(board.lists[0].save).toHaveBeenCalledTimes(1);
    });

    it("returns null when the list is not found", async () => {
      const board = makeBoard({ lists: makeLists([]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.editList(board._id.toString(), "missing", { name: "New" });

      expect(result).toBeNull();
    });
  });

  describe("shiftTask", () => {
    it("moves a task within the same list", async () => {
      const listId = new mongoose.Types.ObjectId();
      const t1 = makeTask({ name: "t1" });
      const t2 = makeTask({ name: "t2" });
      const board = makeBoard({ lists: makeLists([{ _id: listId, tasks: [t1, t2] }]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      await boardController.shiftTask(
        board._id.toString(),
        listId.toString(),
        0,
        listId.toString(),
        1
      );

      expect(board.lists[0].tasks).toEqual([t2, t1]);
      expect(board.save).toHaveBeenCalledTimes(1);
    });

    it("moves a task between lists", async () => {
      const sourceListId = new mongoose.Types.ObjectId();
      const destListId = new mongoose.Types.ObjectId();
      const t1 = makeTask({ name: "t1" });
      const board = makeBoard({
        lists: makeLists([
          { _id: sourceListId, tasks: [t1] },
          { _id: destListId, tasks: [] },
        ]),
      });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      await boardController.shiftTask(
        board._id.toString(),
        sourceListId.toString(),
        0,
        destListId.toString(),
        0
      );

      expect(board.lists[0].tasks).toEqual([]);
      expect(board.lists[1].tasks).toEqual([t1]);
    });
  });

  describe("deleteList", () => {
    it("removes the list matching listId", async () => {
      const listA = { _id: new mongoose.Types.ObjectId() };
      const listB = { _id: new mongoose.Types.ObjectId() };
      const board = makeBoard({ lists: makeLists([listA, listB]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.deleteList(board._id.toString(), listA._id.toString());

      expect(board.lists.map((l) => l._id)).toEqual([listB._id]);
      expect(result).toBe(listA._id.toString());
    });

    it("leaves lists unchanged when listId does not match any list", async () => {
      const listA = { _id: new mongoose.Types.ObjectId() };
      const listB = { _id: new mongoose.Types.ObjectId() };
      const board = makeBoard({ lists: makeLists([listA, listB]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      await boardController.deleteList(board._id.toString(), "does-not-exist");

      expect(board.lists.map((l) => l._id)).toEqual([listA._id, listB._id]);
    });
  });

  describe("createTask", () => {
    it("pushes a task onto the matching list and returns it", async () => {
      const listId = new mongoose.Types.ObjectId();
      const board = makeBoard({ lists: makeLists([{ _id: listId, tasks: [] }]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const task = { name: "New Task", content: "", color: "none" } as TaskDocument;
      const result = await boardController.createTask(board._id.toString(), listId.toString(), task);

      expect(result.listId).toBe(listId.toString());
      expect(result.task).toMatchObject({ name: "New Task" });
      expect(board.save).toHaveBeenCalledTimes(1);
    });

    it("still saves the board even when the list is not found", async () => {
      const board = makeBoard({ lists: makeLists([]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.createTask(
        board._id.toString(),
        "missing-list",
        { name: "x" } as TaskDocument
      );

      expect(result.task).toBeUndefined();
      expect(board.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("editTask", () => {
    it("updates the matching task's fields", async () => {
      const listId = new mongoose.Types.ObjectId();
      const taskId = new mongoose.Types.ObjectId();
      const task = makeTask({ _id: taskId, name: "Old", content: "old" });
      const board = makeBoard({ lists: makeLists([{ _id: listId, tasks: [task] }]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.editTask(
        board._id.toString(),
        listId.toString(),
        taskId.toString(),
        { name: "New", content: "new", color: "blue" }
      );

      expect(result?.task).toMatchObject({ name: "New", content: "new", color: "blue" });
    });

    it("returns null when the list is not found", async () => {
      const board = makeBoard({ lists: makeLists([]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.editTask(
        board._id.toString(),
        "missing-list",
        "task-1",
        { name: "New" }
      );

      expect(result).toBeNull();
    });

    it("returns null when the task is not found in the list", async () => {
      const listId = new mongoose.Types.ObjectId();
      const board = makeBoard({ lists: makeLists([{ _id: listId, tasks: [] }]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.editTask(board._id.toString(), listId.toString(), "missing-task", {
        name: "New",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteTask", () => {
    it("removes the matching task", async () => {
      const listId = new mongoose.Types.ObjectId();
      const taskId = new mongoose.Types.ObjectId();
      const task = makeTask({ _id: taskId, name: "Task" });
      const board = makeBoard({ lists: makeLists([{ _id: listId, tasks: [task] }]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.deleteTask(
        board._id.toString(),
        listId.toString(),
        taskId.toString()
      );

      expect(result?.task).toBe(task);
      expect(board.lists[0].tasks).toEqual([]);
    });

    it("returns null when the list is not found", async () => {
      const board = makeBoard({ lists: makeLists([]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.deleteTask(board._id.toString(), "missing-list", "task-1");

      expect(result).toBeNull();
    });

    it("returns null and leaves tasks unchanged when taskId does not match", async () => {
      const listId = new mongoose.Types.ObjectId();
      const t1 = makeTask({ name: "t1" });
      const t2 = makeTask({ name: "t2" });
      const board = makeBoard({ lists: makeLists([{ _id: listId, tasks: [t1, t2] }]) });
      MockedBoardModel.findById = jest.fn().mockResolvedValue(board);

      const result = await boardController.deleteTask(board._id.toString(), listId.toString(), "missing-task");

      expect(result).toBeNull();
      expect(board.lists[0].tasks).toEqual([t1, t2]);
    });
  });
});
