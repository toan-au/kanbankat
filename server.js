const express = require('express');
const cookieSession = require('cookie-session');
const keys = require('./config/keys');
const passport = require('passport');
const mongoose = require('mongoose');

// models
require('./models/user');
require('./models/board.js');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = express();

// middleware
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

app.use(passport.initialize());
app.use(passport.session());

// routes
require('./routes/auth')(app);
require('./routes/board')(app);

app.listen(process.env.PORT || 5000, () => {
  console.log('server has been started');
});
