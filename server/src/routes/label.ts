import { Request, Response, Router } from "express";
import { createLabelHandler, deleteLabelHandler, editLabelHandler, getLabelsHandler } from "../controllers/labels.controller"
import requireLogin from "../middleware/requireLogin";
import requireOwnBoard from "../middleware/requireOwnBoard";
import express from "express"

const router: Router = express.Router();

router.post(
  "/board/:boardId/labels",
  requireLogin,
  requireOwnBoard,
  async (req: Request, res: Response) => await createLabelHandler(req, res)
);

router.get(
  "/board/:boardId/labels",
  requireLogin,
  requireOwnBoard,
  async (req: Request, res: Response) => await getLabelsHandler(req, res)
);

router.patch(
  "/board/:boardId/label/:id",
  requireLogin,
  requireOwnBoard,
  async (req: Request, res: Response) => await editLabelHandler(req, res)
);

router.delete(
  "/board/:boardId/label/:id",
  requireLogin,
  requireOwnBoard,
  async (req: Request, res: Response) => await deleteLabelHandler(req, res)
);

export default router;
