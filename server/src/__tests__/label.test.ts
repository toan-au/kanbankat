import mongoose from "mongoose";
import supertest from "supertest";

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

const mockBoardId = new mongoose.Types.ObjectId();
const mockLabelId = new mongoose.Types.ObjectId();

describe("Label Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/board/:boardId/labels", () => {
    it("creates a label without requiring authentication (no requireLogin/requireOwnBoard on this router)", async () => {
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

  describe("GET /api/board/:boardId/labels", () => {
    it("returns labels without requiring authentication", async () => {
      const labels = [{ _id: mockLabelId, text: "Bug", hexColour: "#FF0000" }];
      (getLabelsHandler as jest.Mock).mockImplementation((_req, res) => res.send(labels));

      const response = await testApp.get(`/api/board/${mockBoardId}/labels`).expect(200);

      expect(getLabelsHandler).toHaveBeenCalled();
      expect(response.body).toHaveLength(1);
    });
  });

  describe("PATCH /api/board/:boardId/label/:id", () => {
    it("updates a label without requiring authentication", async () => {
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

  describe("DELETE /api/board/:boardId/label/:id", () => {
    it("deletes a label without requiring authentication", async () => {
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
