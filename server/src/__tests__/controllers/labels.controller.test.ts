import { Request, Response } from "express";

jest.mock("../../services/label.service");

import {
  createLabel,
  getLabels,
  findAndUpdateLabel,
  findAndDeleteLabel,
} from "../../services/label.service";
import {
  createLabelHandler,
  getLabelsHandler,
  editLabelHandler,
  deleteLabelHandler,
} from "../../controllers/labels.controller";

function makeRes() {
  const send = jest.fn();
  return { send } as unknown as Response;
}

describe("labels.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLabelHandler", () => {
    it("creates a label scoped to the board in the URL and sends it back", async () => {
      const req = {
        params: { boardId: "board-1" },
        body: { text: "Bug", hexColour: "#FF0000" },
      } as unknown as Request;
      const res = makeRes();
      const created = { _id: "label-1", text: "Bug", hexColour: "#FF0000", board: "board-1" };
      (createLabel as jest.Mock).mockResolvedValue(created);

      await createLabelHandler(req, res);

      expect(createLabel).toHaveBeenCalledWith({
        text: "Bug",
        hexColour: "#FF0000",
        board: "board-1",
      });
      expect(res.send).toHaveBeenCalledWith(created);
    });
  });

  describe("getLabelsHandler", () => {
    it("fetches labels for the board in the URL", async () => {
      const req = { params: { boardId: "board-1" } } as unknown as Request;
      const res = makeRes();
      const labels = [{ _id: "label-1" }];
      (getLabels as jest.Mock).mockResolvedValue(labels);

      await getLabelsHandler(req, res);

      expect(getLabels).toHaveBeenCalledWith({ board: "board-1" });
      expect(res.send).toHaveBeenCalledWith(labels);
    });
  });

  describe("editLabelHandler", () => {
    it("updates the label scoped to board + id", async () => {
      const req = {
        params: { boardId: "board-1", id: "label-1" },
        body: { text: "Renamed" },
      } as unknown as Request;
      const res = makeRes();
      const updated = { _id: "label-1", text: "Renamed" };
      (findAndUpdateLabel as jest.Mock).mockResolvedValue(updated);

      await editLabelHandler(req, res);

      expect(findAndUpdateLabel).toHaveBeenCalledWith(
        { board: "board-1", _id: "label-1" },
        { text: "Renamed" }
      );
      expect(res.send).toHaveBeenCalledWith(updated);
    });
  });

  describe("deleteLabelHandler", () => {
    it("deletes the label scoped to board + id", async () => {
      const req = { params: { boardId: "board-1", id: "label-1" } } as unknown as Request;
      const res = makeRes();
      const deleted = { _id: "label-1" };
      (findAndDeleteLabel as jest.Mock).mockResolvedValue(deleted);

      await deleteLabelHandler(req, res);

      expect(findAndDeleteLabel).toHaveBeenCalledWith({ board: "board-1", _id: "label-1" });
      expect(res.send).toHaveBeenCalledWith(deleted);
    });
  });
});
