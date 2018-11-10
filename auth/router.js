const express = require('express');
const jsonwebtoken = require('jsonwebtoken');

const { localPassportMiddleware, jwtPassportMiddleware } = require('./strategy');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const authRouter = express.Router();

// Creates a new jsonwebtoken
function createJwtToken(user) {
  return jsonwebtoken.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
}

// Logs user in if their info is valid
authRouter.post('/login', localPassportMiddleware, (req, res) => {
  const user = req.user.serialize();
  const jwtToken = createJwtToken(user);
  res.json({ jwtToken, user });
});

// Creates a new jsonwebtoken for a user
authRouter.post('/refresh', jwtPassportMiddleware, (req, res) => {
  const user = req.user;
  const jwtToken = createJwtToken(user);
  res.json({ jwtToken, user });
});

module.exports = { authRouter };
