const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const keys = require("../config/keys");
const mongoose = require("mongoose");

const User = mongoose.model("User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      // console.log(profile);
      // check if user exists in DB
      console.log(profile);
      const existingUser = await User.findOne({
        googleId: profile.id,
      });

      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = await new User({
        googleId: profile.id,
        displayName: profile.displayName,
      }).save();
      done(null, newUser);
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: keys.githubClientID,
      clientSecret: keys.githubClientSecret,
      callbackURL: "/auth/github/callback",
      proxy: true,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const existingUser = await User.findOne({
        githubId: profile.id,
      });

      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = await new User({
        githubId: profile.id,
        displayName: profile.displayName,
      }).save();
      done(null, newUser);
    }
  )
);

module.exports = passport;
