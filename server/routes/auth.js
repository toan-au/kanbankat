const express = require("express");
const router = express.Router();
const passport = require("../auth/passport");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email"], display: "popup" })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/oauth/success",
    failureRedirect: "/",
  }),
  (_req, res) => {
    res.redirect("/dashboard");
  }
);

router.get("/github", passport.authenticate("github", { scope: ["email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/oauth/success",
    failureRedirect: "/",
  }),
  (_req, res) => {
    res.redirect("/dashboard");
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/current", (req, res) => {
  if (req.user) {
    return res.send(req.user);
  }
  res.send({});
});

module.exports = router;
