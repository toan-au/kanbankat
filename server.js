const express = require('express');

const app = express();

// models

// routes
require('./routes/auth')(app);

app.listen(process.env.PORT || 5000, () => {
  console.log('server has been started');
});
