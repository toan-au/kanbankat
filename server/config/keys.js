if (process.env.NODE_ENV === 'production') {
  module.exports = require('./prodkeys');
} else {
  module.exports = require('./devkeys');
}
