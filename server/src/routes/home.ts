import { Request, Response, Router } from "express";
import Label from "../models/label.model";
import User from "../models/user.model";

const express = require("express");

const router: Router = express.Router();

router.get("/healthcheck", (_: Request, res: Response) => res.sendStatus(200));

export default router;
