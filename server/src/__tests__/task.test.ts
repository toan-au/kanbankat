import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import supertest from "supertest";
import boardController from "../controllers/boards.controller";
import { BoardDocument, UserDocument } from "../types";

// Mock middlewares - must be defined before jest.mock calls
let mockRequireLogin = jest.fn();
let mockRequireOwnBoard = jest.fn();

jest.mock("../middleware/requireLogin", () => ({
  __esModule: true,
  default: (...args: any[]) => mockRequireLogin(...args),
}));

jest.mock("../middleware/requireOwnBoard", () => ({
  __esModule: true,
  default: (...args: any[]) => mockRequireOwnBoard(...args),
}));

// Mock board controller
jest.mock("../controllers/boards.controller");

// Import app after mocks are set up
import app from "../app";

const testApp = supertest(app);

// Test data
const mockUserId = new mongoose.Types.ObjectId();
const mockBoardId = new mongoose.Types.ObjectId();
const mockListId = new mongoose.Types.ObjectId();
const mockTaskId = new mongoose.Types.ObjectId();

const mockUser: Partial<UserDocument> = {
  _id: mockUserId.toString(),
  githubId: "github-test-id",
  displayName: "test-user",
  boards: [{ _id: mockBoardId } as BoardDocument],
};

const mockBoard: Partial<BoardDocument> = {
  _id: mockBoardId,
  name: "Test Board",
  user: mockUserId,
  lists: [
    {
      _id: mockListId,
      name: "Test List",
      tasks: [
        {
          _id: mockTaskId,
          name: "Test Task",
          content: "Test Content",
          color: "blue",
        },
      ],
    },
  ] as any,
  deleted: false,
};

describe("Task Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/board/:boardId/list/:listId/task", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .post(`/api/board/${mockBoardId}/list/${mockListId}/task`)
          .send({ name: "New Task", content: "Task content", color: "blue" })
          .expect(403);
      });
    });

    describe("when user does not own the board", () => {
      it("should return 401", async () => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );

        mockRequireOwnBoard.mockImplementation(
          (_req: Request, res: Response) => {
            return res
              .status(401)
              .send({ error: "this is not your board" });
          }
        );

        await testApp
          .post(`/api/board/${mockBoardId}/list/${mockListId}/task`)
          .send({ name: "New Task", content: "Task content", color: "blue" })
          .expect(401);
      });
    });

    describe("when user owns the board", () => {
      beforeEach(() => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );

        mockRequireOwnBoard.mockImplementation(
          (_req: Request, _res: Response, next: NextFunction) => {
            next();
          }
        );
      });

      it("should create a new task", async () => {
        const newTask = {
          task: {
            _id: mockTaskId,
            name: "New Task",
            content: "Task content",
            color: "blue",
          },
          listId: mockListId,
        };
        (boardController.createTask as jest.Mock).mockResolvedValue(newTask);

        const response = await testApp
          .post(`/api/board/${mockBoardId}/list/${mockListId}/task`)
          .send({ name: "New Task", content: "Task content", color: "blue" })
          .expect(200);

        expect(boardController.createTask).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          { _id: undefined, name: "New Task", content: "Task content", color: "blue" }
        );
        expect(response.body.task.name).toBe("New Task");
      });

      it("should create a task with custom _id", async () => {
        const customTaskId = new mongoose.Types.ObjectId();
        const newTask = {
          task: {
            _id: customTaskId,
            name: "Custom Task",
            content: "Content",
            color: "red",
          },
          listId: mockListId,
        };
        (boardController.createTask as jest.Mock).mockResolvedValue(newTask);

        await testApp
          .post(`/api/board/${mockBoardId}/list/${mockListId}/task`)
          .send({
            _id: customTaskId,
            name: "Custom Task",
            content: "Content",
            color: "red",
          })
          .expect(200);

        expect(boardController.createTask).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          {
            _id: customTaskId.toString(),
            name: "Custom Task",
            content: "Content",
            color: "red",
          }
        );
      });
    });
  });

  describe("PATCH /api/board/:boardId/list/:listId/task/:taskId", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .patch(
            `/api/board/${mockBoardId}/list/${mockListId}/task/${mockTaskId}`
          )
          .send({ name: "Updated Task" })
          .expect(403);
      });
    });

    describe("when user does not own the board", () => {
      it("should return 401", async () => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );

        mockRequireOwnBoard.mockImplementation(
          (_req: Request, res: Response) => {
            return res
              .status(401)
              .send({ error: "this is not your board" });
          }
        );

        await testApp
          .patch(
            `/api/board/${mockBoardId}/list/${mockListId}/task/${mockTaskId}`
          )
          .send({ name: "Updated Task" })
          .expect(401);
      });
    });

    describe("when user owns the board", () => {
      beforeEach(() => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );

        mockRequireOwnBoard.mockImplementation(
          (_req: Request, _res: Response, next: NextFunction) => {
            next();
          }
        );
      });

      it("should update task name", async () => {
        const updatedTask = {
          task: { ...mockBoard.lists![0].tasks[0], name: "Updated Task" },
          listId: mockListId,
        };
        (boardController.editTask as jest.Mock).mockResolvedValue(updatedTask);

        const response = await testApp
          .patch(
            `/api/board/${mockBoardId}/list/${mockListId}/task/${mockTaskId}`
          )
          .send({ name: "Updated Task" })
          .expect(200);

        expect(boardController.editTask).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          mockTaskId.toString(),
          { name: "Updated Task", content: undefined, color: undefined }
        );
        expect(response.body.task.name).toBe("Updated Task");
      });

      it("should update task content and color", async () => {
        const updatedTask = {
          task: {
            ...mockBoard.lists![0].tasks[0],
            content: "New content",
            color: "green",
          },
          listId: mockListId,
        };
        (boardController.editTask as jest.Mock).mockResolvedValue(updatedTask);

        const response = await testApp
          .patch(
            `/api/board/${mockBoardId}/list/${mockListId}/task/${mockTaskId}`
          )
          .send({ content: "New content", color: "green" })
          .expect(200);

        expect(boardController.editTask).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          mockTaskId.toString(),
          { name: undefined, content: "New content", color: "green" }
        );
        expect(response.body.task.content).toBe("New content");
        expect(response.body.task.color).toBe("green");
      });
    });
  });

  describe("DELETE /api/board/:boardId/list/:listId/task/:taskId", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .delete(
            `/api/board/${mockBoardId}/list/${mockListId}/task/${mockTaskId}`
          )
          .expect(403);
      });
    });

    describe("when user does not own the board", () => {
      it("should return 401", async () => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );

        mockRequireOwnBoard.mockImplementation(
          (_req: Request, res: Response) => {
            return res
              .status(401)
              .send({ error: "this is not your board" });
          }
        );

        await testApp
          .delete(
            `/api/board/${mockBoardId}/list/${mockListId}/task/${mockTaskId}`
          )
          .expect(401);
      });
    });

    describe("when user owns the board", () => {
      beforeEach(() => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );

        mockRequireOwnBoard.mockImplementation(
          (_req: Request, _res: Response, next: NextFunction) => {
            next();
          }
        );
      });

      it("should delete the task", async () => {
        const deletedTask = {
          task: mockBoard.lists![0].tasks[0],
          listId: mockListId,
        };
        (boardController.deleteTask as jest.Mock).mockResolvedValue(
          deletedTask
        );

        const response = await testApp
          .delete(
            `/api/board/${mockBoardId}/list/${mockListId}/task/${mockTaskId}`
          )
          .expect(200);

        expect(boardController.deleteTask).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          mockTaskId.toString()
        );
        expect(response.body.task.name).toBe("Test Task");
      });
    });
  });
});
