const express = require('express');

const app = express();

// require models

app.listen(process.env.PORT || 5000, () => {
  console.log('server has been started');
});
