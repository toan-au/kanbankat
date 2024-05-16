import express, { Router } from "express";
import passport from "../auth/passport";

const router: Router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["email"] }));

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

router.get("/logout", (req, res, next) => {
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

export default router;
