import { Request, Response, Router } from "express";
import express from "express"

const router: Router = express.Router();

router.get("/healthcheck", (_: Request, res: Response) => res.sendStatus(200));

export default router;
