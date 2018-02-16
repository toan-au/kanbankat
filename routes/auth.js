const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./config/keys');

// configure passport
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientId,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/'
    },
    (accessToken, refreshToken, profile, cb) => {}
  )
);

module.exports = app => {
  app.get('/api/test', (req, res) => {
    res.send({ success: true });
  });
};
