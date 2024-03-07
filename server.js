const express = require("express");
require("express-async-errors");
const cookieSession = require("cookie-session");
const keys = require("./config/keys");
const passport = require("passport");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// models
require("./models/user");
require("./models/board.js");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = express();

// middleware

app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);

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
require("./routes/auth")(app);
require("./routes/board")(app);

// error handling

app.use((error, req, res, next) => {
  console.error(error);
  error.statusCode ??= 500;
  error.status ??= "error";
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

// client app
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  // express will serve our static bundle files
  app.use(express.static("client-vite/dist/"));

  // express will serve our client app if it doesn't recognize the route
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client-vite", "dist", "index.html"));
  });
}

app.listen(process.env.PORT || 5000, () => {
  console.log("server has been started");
});
