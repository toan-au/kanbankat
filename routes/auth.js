const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./config/keys');

// configure passport
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
