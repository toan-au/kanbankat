import express from "express";
import mongoose from "mongoose";
import "express-async-errors";
import path from "path";
import keys from "../config/keys";
import app from "./app";

// Set up mongoose promise library
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose
  .connect(keys.mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Configure static file serving and catch-all route for production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../../../client-vite/dist");

  // Serve static files from the React app
  app.use(express.static(clientPath));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(clientPath, "index.html"));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

