import passport from "passport";
import PassportGoogle from "passport-google-oauth20";
import PassportGitHub from "passport-github";
import keys from "../../config/keys";
import mongoose from "mongoose";
import { UserDocument } from "../types";

const User = mongoose.model<UserDocument>("User");
const GitHubStrategy = PassportGitHub.Strategy;
const GoogleStrategy = PassportGoogle.Strategy;

passport.serializeUser((user, done) => {
  done(null, user._id);
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
    },
    async (_accessToken: string, _refreshToken: string, profile, done) => {
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

export default passport;
