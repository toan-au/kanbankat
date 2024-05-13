const express = require("express");
require("express-async-errors");
const keys = require("./config/keys");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = require("./app.js");

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
