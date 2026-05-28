const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
  // Testiympäristössä ohitetaan autentikointi
  if (process.env.NODE_ENV === "test") {
    req.user = { email: "test@test.com" };
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Pääsy evätty: Kirjaudu ensin sisään." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "Virheellinen tai vanhentunut istunto." });
    }
    req.user = user;
    next();
  });
};

module.exports = authToken;
