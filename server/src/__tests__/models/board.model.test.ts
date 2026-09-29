import mongoose from "mongoose";
import { connect, closeDatabase, clearDatabase } from "../setup/mongoMemoryServer";
import BoardModel from "../../models/board.model";
import LabelModel from "../../models/label.model";
import { BoardDocument } from "../../types";

// `labels` is set by board.model.ts's schema/hook but isn't declared on the
// BoardDocument TS interface; `text` is the label schema's actual field,
// while the LabelDocument interface (mis-)declares it as `name`. Both are
// existing type/schema mismatches, not fixed here — these local types just
// let the tests access the real runtime shape without an `any` escape hatch.
type BoardWithLabels = BoardDocument & { labels: unknown[] };
type LabelWithText = { text: string };

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Board model", () => {
  describe("pre('save') hook", () => {
    it("auto-creates the 6 default labels for a new board and assigns them", async () => {
      const board = new BoardModel({ name: "New Board", user: new mongoose.Types.ObjectId() });

      await board.save();

      expect((board as unknown as BoardWithLabels).labels).toHaveLength(6);

      const savedLabels = await LabelModel.find({ board: board._id });
      expect(savedLabels).toHaveLength(6);
      expect(savedLabels.map((l) => (l as unknown as LabelWithText).text).sort()).toEqual(
        ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5", "Label 6"].sort()
      );
    });

    it("does not create additional labels when re-saving an already-persisted board's other fields", async () => {
      const board = new BoardModel({ name: "New Board", user: new mongoose.Types.ObjectId() });
      await board.save();

      // NOTE: the hook only calls next() inside `if (this.isNew)`. Re-saving
      // here relies on Mongoose treating an unmodified, already-persisted
      // document's second .save() as a no-op that skips pending pre-save
      // middleware; if that ever changes, this hook would hang because next()
      // is never called on the non-isNew branch.
      await board.save();

      const labels = await LabelModel.find({ board: board._id });
      expect(labels).toHaveLength(6);
    });
  });

  describe("pre('deleteOne', {document: true}) hook", () => {
    it("does NOT actually remove the board's labels, because it filters by 'user' instead of 'board' (existing bug, documented not fixed)", async () => {
      const board = new BoardModel({ name: "To Delete", user: new mongoose.Types.ObjectId() });
      await board.save();
      expect(await LabelModel.countDocuments({ board: board._id })).toBe(6);

      await board.deleteOne();

      // Label documents have no `user` field (see label.model.ts), so
      // `Label.deleteMany({ user: this._id })` matches nothing and the
      // labels are silently orphaned instead of being cleaned up.
      const remainingLabels = await LabelModel.find({ board: board._id });
      expect(remainingLabels).toHaveLength(6);
    });
  });
});

describe("Label model validation", () => {
  it("requires a valid hex colour", async () => {
    const label = new LabelModel({
      text: "Invalid",
      hexColour: "not-a-colour",
      board: new mongoose.Types.ObjectId(),
    });

    await expect(label.validate()).rejects.toThrow(/hexColour/);
  });

  it("accepts a valid 6-digit hex colour", async () => {
    const label = new LabelModel({
      text: "Valid",
      hexColour: "#ABCDEF",
      board: new mongoose.Types.ObjectId(),
    });

    await expect(label.validate()).resolves.toBeUndefined();
  });

  it("requires text", async () => {
    const label = new LabelModel({
      hexColour: "#ABCDEF",
      board: new mongoose.Types.ObjectId(),
    });

    await expect(label.validate()).rejects.toThrow(/text/);
  });

  it("rejects text longer than 50 characters", async () => {
    const label = new LabelModel({
      text: "x".repeat(51),
      hexColour: "#ABCDEF",
      board: new mongoose.Types.ObjectId(),
    });

    await expect(label.validate()).rejects.toThrow(/text/);
  });
});
