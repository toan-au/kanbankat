const express = require('express');
const cookieSession = require('cookie-session');
const keys = require('./config/keys');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// models
require('./models/user');
require('./models/board.js');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = express();

// middleware

app.use(bodyParser.json());
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

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  // express will serve our static bundle files
  app.use(express.static('client/build/'));

  // express will serve our client app if it doesn't recognize the route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(process.env.PORT || 5000, () => {
  console.log('server has been started');
});
