import { Request, Response, Router } from "express";
import Label from "../models/label.model";
import User from "../models/user.model";

const express = require("express");

const router: Router = express.Router();

router.get("/healthcheck", (_: Request, res: Response) => res.sendStatus(200));

router.get("/test-labels", async (req: Request, res: Response) => {
  const userId = req.user?._id;
  // Create a label for a user
  const newLabel = new Label({
    text: "Important",
    hexColour: "#FF0000",
    user: userId, // Assuming you have the user's ID
  });
  await newLabel.save();

  // Associate a label with a user
  const user = await User.findByIdAndUpdate(userId, {
    $push: { labels: newLabel._id },
  });

  res.send(user?.labels);
});

export default router;
