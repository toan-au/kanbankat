import { NextFunction, Request, Response } from "express";

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieSession from "cookie-session";
import handleErrors from "./middleware/handleErrors";
import forceHttps from "./middleware/forceHttps";
import keys from "../config/keys";
import passport from "passport";

// models
import "./models/user.model";
import "./models/board.model";

// routes
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/board";
import homeRoutes from "./routes/home";

const app = express();

// middleware

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);

app.enable("trust proxy");
app.use(forceHttps);

// register regenerate & save after the cookieSession middleware initialization
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb: () => void) => {
      cb();
    };
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb: () => void) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/", boardRoutes);
app.use(homeRoutes);

// error handling
app.use(handleErrors);

export default app;
