const express = require('express');
const Joi = require('joi');

const { User, UserJoiSchema } = require('./model');

const userRouter = express.Router();

// Grabs all users
userRouter.get('/', (req, res) => {
  User.find()
    .then(users => {
      return res.status(200).json(
        users.map(user => user.serialize())
      );
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

// Grabs a specific user
userRouter.get('/:userid', (req, res) => {
  User.findById(req.params.userid)
    .then(user => {
      return res.status(200).json(user.serialize());
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

// Creates a new user
userRouter.post('/', (req, res) => {
  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password
  };

  // Checks that all provided data passes all schema requirements
  const validation = Joi.validate(newUser, UserJoiSchema);
  if (validation.error) {
    return res.status(422).json({ error: validation.error });
  }

  // Checks that the provided username is not already taken
  User.find({ username: newUser.username })
    .count()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({ error: 'Username already taken' });
      }
      return User.hashPassword(newUser.password);
    })
    // Hashes provided password
    .then(passwordHash => {
      newUser.password = passwordHash;

      // Creates a new User object using provided data
      User.create(newUser)
        .then(user => {
          return res.status(201).json(user.serialize());
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({ error: err.message });
        });
    });
});

module.exports = { userRouter };
