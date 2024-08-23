import { Request, Response, Router } from "express";
import { createLabelHandler, deleteLabelHandler, editLabelHandler, getLabelsHandler } from "../controllers/labels.controller"

const express = require("express");

const router: Router = express.Router();

router.post("/labels", async (req: Request, res: Response) => await createLabelHandler(req, res));

router.get("/labels", async (req: Request, res: Response) => await getLabelsHandler(req, res));

router.patch("/label/:id", async (req: Request, res: Response) => await editLabelHandler(req, res));

router.delete("/label/:id", async (req: Request, res: Response) => await deleteLabelHandler(req, res));

export default router;
