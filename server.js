const express = require('express');

const app = express();

// require models

app.listen(process.env.PORT || 3000, () => {
  console.log('server has been started');
});
