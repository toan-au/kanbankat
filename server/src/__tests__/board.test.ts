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

describe("Board Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/test", () => {
    it("should return test object", async () => {
      const response = await testApp.get("/api/test").expect(200);
      expect(response.body).toEqual({ test: true });
    });
  });

  describe("POST /api/board", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .post("/api/board")
          .send({ name: "New Board" })
          .expect(403);
      });
    });

    describe("when user is authenticated", () => {
      it("should create a board and return 200", async () => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );

        const newBoard = { ...mockBoard, name: "New Board" };
        (boardController.createBoard as jest.Mock).mockResolvedValue(newBoard);

        const response = await testApp
          .post("/api/board")
          .send({ name: "New Board" })
          .expect(200);

        expect(boardController.createBoard).toHaveBeenCalledWith(
          "New Board",
          mockUserId.toString()
        );
        expect(response.body.name).toBe("New Board");
      });
    });
  });

  describe("GET /api/boards", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp.get("/api/boards").expect(403);
      });
    });

    describe("when user is authenticated and has boards", () => {
      beforeEach(() => {
        mockRequireLogin.mockImplementation(
          (req: Request, _res: Response, next: NextFunction) => {
            req.user = mockUser as UserDocument;
            next();
          }
        );
      });

      it("should return all active boards", async () => {
        const mockBoards = [mockBoard];
        (boardController.getBoards as jest.Mock).mockResolvedValue(mockBoards);

        const response = await testApp.get("/api/boards").expect(200);

        expect(boardController.getBoards).toHaveBeenCalledWith(
          mockUserId.toString(),
          false
        );
        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe("Test Board");
      });

      it("should return deleted boards when deleted param is true", async () => {
        const deletedBoard = { ...mockBoard, deleted: true };
        (boardController.getBoards as jest.Mock).mockResolvedValue([
          deletedBoard,
        ]);

        const response = await testApp
          .get("/api/boards?deleted=true")
          .expect(200);

        expect(boardController.getBoards).toHaveBeenCalledWith(
          mockUserId.toString(),
          true
        );
        expect(response.body[0].deleted).toBe(true);
      });

      it("should return empty array when user has no boards", async () => {
        (boardController.getBoards as jest.Mock).mockResolvedValue([]);

        const response = await testApp.get("/api/boards").expect(200);

        expect(response.body).toEqual([]);
      });
    });
  });

  describe("GET /api/board/:boardId", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp.get(`/api/board/${mockBoardId}`).expect(403);
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

        await testApp.get(`/api/board/${mockBoardId}`).expect(401);
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

      it("should return the board", async () => {
        (boardController.getBoard as jest.Mock).mockResolvedValue(mockBoard);

        const response = await testApp
          .get(`/api/board/${mockBoardId}`)
          .expect(200);

        expect(boardController.getBoard).toHaveBeenCalledWith(
          mockBoardId.toString()
        );
        expect(response.body.name).toBe("Test Board");
      });
    });
  });

  describe("PATCH /api/board/:boardId", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .patch(`/api/board/${mockBoardId}`)
          .send({ name: "Updated Board" })
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
          .patch(`/api/board/${mockBoardId}`)
          .send({ name: "Updated Board" })
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

      it("should update board name", async () => {
        const updatedBoard = { ...mockBoard, name: "Updated Board" };
        (boardController.editBoard as jest.Mock).mockResolvedValue(
          updatedBoard
        );

        const response = await testApp
          .patch(`/api/board/${mockBoardId}`)
          .send({ name: "Updated Board" })
          .expect(200);

        expect(boardController.editBoard).toHaveBeenCalledWith(
          mockBoardId.toString(),
          { name: "Updated Board", deleted: undefined }
        );
        expect(response.body.name).toBe("Updated Board");
      });

      it("should update board deleted status", async () => {
        const archivedBoard = { ...mockBoard, deleted: true };
        (boardController.editBoard as jest.Mock).mockResolvedValue(
          archivedBoard
        );

        const response = await testApp
          .patch(`/api/board/${mockBoardId}`)
          .send({ deleted: true })
          .expect(200);

        expect(boardController.editBoard).toHaveBeenCalledWith(
          mockBoardId.toString(),
          { name: undefined, deleted: true }
        );
        expect(response.body.deleted).toBe(true);
      });
    });
  });

  describe("DELETE /api/board/:boardId", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp.delete(`/api/board/${mockBoardId}`).expect(403);
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

        await testApp.delete(`/api/board/${mockBoardId}`).expect(401);
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

      it("should soft delete the board", async () => {
        const deletedBoard = {
          ...mockBoard,
          deleted: true,
          deletedOn: new Date(),
        };
        (boardController.deleteBoard as jest.Mock).mockResolvedValue(
          deletedBoard
        );

        const response = await testApp
          .delete(`/api/board/${mockBoardId}`)
          .expect(200);

        expect(boardController.deleteBoard).toHaveBeenCalledWith(
          mockBoardId.toString()
        );
        expect(response.body.deleted).toBe(true);
      });
    });
  });

  describe("DELETE /api/board/destroy/:boardId", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .delete(`/api/board/destroy/${mockBoardId}`)
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
          .delete(`/api/board/destroy/${mockBoardId}`)
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

      it("should permanently delete the board", async () => {
        (boardController.destroyBoard as jest.Mock).mockResolvedValue(
          mockBoard
        );

        const response = await testApp
          .delete(`/api/board/destroy/${mockBoardId}`)
          .expect(200);

        expect(boardController.destroyBoard).toHaveBeenCalledWith(
          mockBoardId.toString()
        );
        expect(response.body.name).toBe("Test Board");
      });
    });
  });

  describe("PATCH /api/board/:boardId/lists", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .patch(`/api/board/${mockBoardId}/lists`)
          .send({ boardId: mockBoardId, sourceIndex: 0, destinationIndex: 1 })
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

      it("should reorder lists", async () => {
        const reorderedBoard = { ...mockBoard };
        (boardController.shiftLists as jest.Mock).mockResolvedValue(
          reorderedBoard
        );

        const response = await testApp
          .patch(`/api/board/${mockBoardId}/lists`)
          .send({ boardId: mockBoardId, sourceIndex: 0, destinationIndex: 1 })
          .expect(200);

        expect(boardController.shiftLists).toHaveBeenCalledWith(
          mockBoardId.toString(),
          0,
          1
        );
        expect(response.body.name).toBe("Test Board");
      });
    });
  });
});
