import { Request, Response } from "express";
import express from "express";
import keys from "../config/keys";
import mongoose from "mongoose";
import "express-async-errors";
import app from "./app";

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

// client app
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  // express will serve our static bundle files
  app.use(express.static(path.resolve(__dirname, "../", "../", "../", "client-vite", "dist")));

  // express will serve our client app if it doesn't recognize the route
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(
      path.resolve(__dirname, "../", "../", "../", "client-vite", "dist", "index.html")
    );
  });
}

app.listen(process.env.PORT || 5000, () => {
  console.log("server has been started");
});
