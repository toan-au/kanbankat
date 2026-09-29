import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import supertest from "supertest";
import boardController from "../controllers/boards.controller";
import { BoardDocument, ListDocument, UserDocument } from "../types";

// Mock middlewares - must be defined before jest.mock calls
const mockRequireLogin = jest.fn();
const mockRequireOwnBoard = jest.fn();

jest.mock("../middleware/requireLogin", () => ({
  __esModule: true,
  default: (req: Request, res: Response, next: NextFunction) =>
    mockRequireLogin(req, res, next),
}));

jest.mock("../middleware/requireOwnBoard", () => ({
  __esModule: true,
  default: (req: Request, res: Response, next: NextFunction) =>
    mockRequireOwnBoard(req, res, next),
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
  ] as unknown as mongoose.Types.DocumentArray<ListDocument>,
  deleted: false,
};

describe("List Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/board/:boardId/list/", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .post(`/api/board/${mockBoardId}/list/`)
          .send({ name: "New List" })
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
          .post(`/api/board/${mockBoardId}/list/`)
          .send({ name: "New List" })
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

      it("should create a new list", async () => {
        const newList = { _id: mockListId, name: "New List", tasks: [] };
        (boardController.createList as jest.Mock).mockResolvedValue(newList);

        const response = await testApp
          .post(`/api/board/${mockBoardId}/list/`)
          .send({ name: "New List" })
          .expect(200);

        expect(boardController.createList).toHaveBeenCalledWith(
          mockBoardId.toString(),
          "New List"
        );
        expect(response.body.name).toBe("New List");
      });
    });
  });

  describe("PATCH /api/board/:boardId/list/:listId/", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .patch(`/api/board/${mockBoardId}/list/${mockListId}/`)
          .send({ name: "Updated List" })
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
          .patch(`/api/board/${mockBoardId}/list/${mockListId}/`)
          .send({ name: "Updated List" })
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

      it("should update the list name", async () => {
        const updatedList = { _id: mockListId, name: "Updated List" };
        (boardController.editList as jest.Mock).mockResolvedValue(updatedList);

        const response = await testApp
          .patch(`/api/board/${mockBoardId}/list/${mockListId}/`)
          .send({ name: "Updated List" })
          .expect(200);

        expect(boardController.editList).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          { name: "Updated List" }
        );
        expect(response.body.name).toBe("Updated List");
      });
    });
  });

  describe("PATCH /api/board/:boardId/lists/tasks", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .patch(`/api/board/${mockBoardId}/lists/tasks`)
          .send({
            boardId: mockBoardId,
            sourceListId: mockListId,
            sourceIndex: 0,
            destinationListId: mockListId,
            destinationIndex: 1,
          })
          .expect(403);
      });
    });

    describe("when user is authenticated", () => {
      beforeEach(() => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );
      });

      it("should move task within same list", async () => {
        (boardController.shiftTask as jest.Mock).mockResolvedValue(mockBoard);

        await testApp
          .patch(`/api/board/${mockBoardId}/lists/tasks`)
          .send({
            boardId: mockBoardId,
            sourceListId: mockListId,
            sourceIndex: 0,
            destinationListId: mockListId,
            destinationIndex: 1,
          })
          .expect(200);

        expect(boardController.shiftTask).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          0,
          mockListId.toString(),
          1
        );
      });

      it("should move task between lists", async () => {
        const destinationListId = new mongoose.Types.ObjectId();
        (boardController.shiftTask as jest.Mock).mockResolvedValue(mockBoard);

        await testApp
          .patch(`/api/board/${mockBoardId}/lists/tasks`)
          .send({
            boardId: mockBoardId,
            sourceListId: mockListId,
            sourceIndex: 0,
            destinationListId: destinationListId,
            destinationIndex: 0,
          })
          .expect(200);

        expect(boardController.shiftTask).toHaveBeenCalledWith(
          mockBoardId.toString(),
          mockListId.toString(),
          0,
          destinationListId.toString(),
          0
        );
      });
    });
  });

  describe("DELETE /api/board/:boardId/list/:listId", () => {
    it("should delete list without authentication (missing middleware)", async () => {
      const listIdString = mockListId.toString();
      (boardController.deleteList as jest.Mock).mockResolvedValue(listIdString);

      const response = await testApp
        .delete(`/api/board/${mockBoardId}/list/${mockListId}`)
        .expect(200);

      expect(boardController.deleteList).toHaveBeenCalledWith(
        mockBoardId.toString(),
        mockListId.toString()
      );
      // res.send() with a string sends it as text, accessible via response.text
      expect(response.text).toBe(listIdString);
    });
  });
});
