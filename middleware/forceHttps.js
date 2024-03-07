module.exports = (req, res, next) => {
  if (req.protocol === "http" && process.env.NODE_ENV === "production") {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
};
