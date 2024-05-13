const express = require("express");

const router = express.Router();

router.get("/healthcheck", (_, res) => res.sendStatus(200));

module.exports = router;
