import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import supertest from "supertest";
import { BoardDocument, UserDocument } from "../types";

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

jest.mock("../controllers/labels.controller");

import {
  createLabelHandler,
  getLabelsHandler,
  editLabelHandler,
  deleteLabelHandler,
} from "../controllers/labels.controller";

// Import app after mocks are set up
import app from "../app";

const testApp = supertest(app);

const mockUserId = new mongoose.Types.ObjectId();
const mockBoardId = new mongoose.Types.ObjectId();
const mockLabelId = new mongoose.Types.ObjectId();

const mockUser: Partial<UserDocument> = {
  _id: mockUserId.toString(),
  githubId: "github-test-id",
  displayName: "test-user",
  boards: [{ _id: mockBoardId } as BoardDocument],
};

describe("Label Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/board/:boardId/labels", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .post(`/api/board/${mockBoardId}/labels`)
          .send({ text: "Bug", hexColour: "#FF0000" })
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

        mockRequireOwnBoard.mockImplementation((_req: Request, res: Response) => {
          return res.status(401).send({ error: "this is not your board" });
        });

        await testApp
          .post(`/api/board/${mockBoardId}/labels`)
          .send({ text: "Bug", hexColour: "#FF0000" })
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

      it("creates a label", async () => {
        const newLabel = { _id: mockLabelId, text: "Bug", hexColour: "#FF0000", board: mockBoardId };
        (createLabelHandler as jest.Mock).mockImplementation((_req, res) => res.send(newLabel));

        const response = await testApp
          .post(`/api/board/${mockBoardId}/labels`)
          .send({ text: "Bug", hexColour: "#FF0000" })
          .expect(200);

        expect(createLabelHandler).toHaveBeenCalled();
        expect(response.body.text).toBe("Bug");
      });
    });
  });

  describe("GET /api/board/:boardId/labels", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp.get(`/api/board/${mockBoardId}/labels`).expect(403);
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

        mockRequireOwnBoard.mockImplementation((_req: Request, res: Response) => {
          return res.status(401).send({ error: "this is not your board" });
        });

        await testApp.get(`/api/board/${mockBoardId}/labels`).expect(401);
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

      it("returns labels", async () => {
        const labels = [{ _id: mockLabelId, text: "Bug", hexColour: "#FF0000" }];
        (getLabelsHandler as jest.Mock).mockImplementation((_req, res) => res.send(labels));

        const response = await testApp.get(`/api/board/${mockBoardId}/labels`).expect(200);

        expect(getLabelsHandler).toHaveBeenCalled();
        expect(response.body).toHaveLength(1);
      });
    });
  });

  describe("PATCH /api/board/:boardId/label/:id", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp
          .patch(`/api/board/${mockBoardId}/label/${mockLabelId}`)
          .send({ text: "Renamed" })
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

        mockRequireOwnBoard.mockImplementation((_req: Request, res: Response) => {
          return res.status(401).send({ error: "this is not your board" });
        });

        await testApp
          .patch(`/api/board/${mockBoardId}/label/${mockLabelId}`)
          .send({ text: "Renamed" })
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

      it("updates a label", async () => {
        const updated = { _id: mockLabelId, text: "Renamed" };
        (editLabelHandler as jest.Mock).mockImplementation((_req, res) => res.send(updated));

        const response = await testApp
          .patch(`/api/board/${mockBoardId}/label/${mockLabelId}`)
          .send({ text: "Renamed" })
          .expect(200);

        expect(editLabelHandler).toHaveBeenCalled();
        expect(response.body.text).toBe("Renamed");
      });
    });
  });

  describe("DELETE /api/board/:boardId/label/:id", () => {
    describe("when user is not authenticated", () => {
      it("should return 403", async () => {
        mockRequireLogin.mockImplementation((_req: Request, res: Response) => {
          return res.sendStatus(403);
        });

        await testApp.delete(`/api/board/${mockBoardId}/label/${mockLabelId}`).expect(403);
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

        mockRequireOwnBoard.mockImplementation((_req: Request, res: Response) => {
          return res.status(401).send({ error: "this is not your board" });
        });

        await testApp.delete(`/api/board/${mockBoardId}/label/${mockLabelId}`).expect(401);
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

      it("deletes a label", async () => {
        const deleted = { _id: mockLabelId };
        (deleteLabelHandler as jest.Mock).mockImplementation((_req, res) => res.send(deleted));

        const response = await testApp
          .delete(`/api/board/${mockBoardId}/label/${mockLabelId}`)
          .expect(200);

        expect(deleteLabelHandler).toHaveBeenCalled();
        expect(response.body._id).toBe(mockLabelId.toString());
      });
    });
  });
});
