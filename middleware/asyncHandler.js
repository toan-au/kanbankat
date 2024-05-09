function asyncHandler(routeHandler) {
  return async (req, res, next) => {
    return Promise.resolve(routeHandler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
