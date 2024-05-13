const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const handleErrors = require("./middleware/handleErrors.js");
const forceHttps = require("./middleware/forceHttps.js");
const keys = require("./config/keys");
const passport = require("passport");

// models
require("./models/user");
require("./models/board.js");

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
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// routes
const authRoutes = require("./routes/auth");
const boardRoutes = require("./routes/board.js");
const homeRoutes = require("./routes/home.js");

app.use("/auth", authRoutes);
app.use("/", boardRoutes);
app.use(homeRoutes);

// error handling
app.use(handleErrors);

module.exports = app;
