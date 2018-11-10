const express = require('express');
const Joi = require('joi');

const dogRouter = express.Router();

const { jwtPassportMiddleware } = require('../auth/strategy');
const { Dog, DogJoiSchema, DogMedicationJoiSchema } = require('./model');

// Create new dog instance
dogRouter.post('/', jwtPassportMiddleware, (req, res) => {
  const newDog = {
    user: req.user.id,
    name: req.body.name,
    breed: req.body.breed,
    weight: req.body.weight,
    gender: req.body.gender,
    age: req.body.age,
  };

  // Checks that provided data passes all schema requirements
  const validation = Joi.validate(newDog, DogJoiSchema);
  if (validation.error) {
    return res.status(422).json({ error: validation.error });
  }

  // Creates a new instance of a dog
  Dog.create(newDog)
    .then(createdDog => {
      return res.status(201).json(createdDog.serialize());
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    });
});

// Retrieve a specific user's dogs
dogRouter.get('/', jwtPassportMiddleware, (req, res) => {
  Dog.find({ user: req.user.id })
    .populate('user', 'firstName lastName username')
    .then(dogs => {
      return res.status(200).json(
        dogs.map(dog => dog.serialize())
      );
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

// Retrieve all dogs' info
dogRouter.get('/all', (req, res) => {
  Dog.find()
    .populate('user', 'firstName lastName username')
    .then(dogs => {
      return res.status(200).json(
        dogs.map(dog => dog.serialize())
      );
    })
    .catch(err => {
      return res.status(500).json(err);
    })
});

// Retrieve instance of a dog by id
dogRouter.get('/:dogid', (req, res) => {
  Dog.findById(req.params.dogid)
    .populate('user', 'firstName lastName username')
    .then(dog => {
      return res.status(200).json(dog.serialize());
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

// Update dog by id
dogRouter.put('/:dogid', jwtPassportMiddleware, (req, res) => {
  const dogUpdate = {};
  const updateableFields = [
    'name',
    'breed',
    'weight',
    'gender',
    'age',
    'vetInfo.vetName',
    'vetInfo.vetLocationName',
    'vetInfo.address'
  ];

  updateableFields.forEach(field => {
    if (field in req.body) {
      dogUpdate[field] = req.body[field];
    }
  });

  // Checks that all provided data passes all schema requirements
  const validation = Joi.validate(dogUpdate, DogJoiSchema);
  if (validation.error) {
    return res.status(422).json({ error: validation.error });
  }

  // Looks for dog by id, if found, updates info
  Dog.findByIdAndUpdate(req.params.dogid, dogUpdate)
    .then(dog => {
      return res.status(204).end();
    })
    .catch(err => {
      return res.status(500).json(err);
    })
});

// Remove dog by id
dogRouter.delete('/:dogid', jwtPassportMiddleware, (req, res) => {
  Dog.findByIdAndRemove(req.params.dogid)
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

module.exports = { dogRouter };
