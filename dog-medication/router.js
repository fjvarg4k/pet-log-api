const express = require('express');
const Joi = require('joi');

const dogMedicationRouter = express.Router();

const { jwtPassportMiddleware } = require('../auth/strategy');
const { DogMedication, DogMedicationJoiSchema } = require('./model');
const { Dog } = require('../dog/model');

// Create new dog medication
dogMedicationRouter.post('/:dogid', jwtPassportMiddleware, (req, res) => {
  const newDogMedication = {
    dog: req.params.dogid,
    name: req.body.name,
    medicationDays: req.body.medicationDays,
    medicationTime: req.body.medicationTime,
    medicationDescription: req.body.medicationDescription
  };

  // Checks that all provided data passes all schema requirements
  const validation = Joi.validate(newDogMedication, DogMedicationJoiSchema);
  if (validation.error) {
    return res.status(422).json({ error: validation.error });
  }

  // Creates a new instance of a dog's medication
  DogMedication.create(newDogMedication)
    .then(createDogMedication => {
      return res.status(201).json(createDogMedication.serialize());
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    });
});

// Retrieve all medication info of a specific dog
dogMedicationRouter.get('/:dogid/all', jwtPassportMiddleware, (req, res) => {
  DogMedication.find({dog: req.params.dogid})
    .then(medications => {
      return res.status(200).json(
        medications.map(medication => medication)
      );
    })
    .catch(err => {
      return res.status(500).json(err);
    })
});

// Retrieve instance of a specific dog's medication by id
dogMedicationRouter.get('/:medicationid', (req, res) => {
  DogMedication.findById(req.params.medicationid)
    .then(medication => {
      return res.status(200).json(medication.serialize());
    })
    .catch(err => {
      return res.status(500).json(err);
    })
});

// update dog medication by id
dogMedicationRouter.put('/:medicationid', jwtPassportMiddleware, (req, res) => {
  const dogMedicationUpdate = {};
  const updateableFields = [
    'name',
    'medicationDays',
    'medicationTime',
    'medicationDescription'
  ];

  updateableFields.forEach(field => {
    if (field in req.body) {
      dogMedicationUpdate[field] = req.body[field];
    }
  });

  const validation = Joi.validate(dogMedicationUpdate, DogMedicationJoiSchema);
  if (validation.error) {
    return res.status(422).json({ error: validation.error });
  }

  DogMedication.findByIdAndUpdate(req.params.medicationid, dogMedicationUpdate)
    .then (medication => {
      return res.status(204).end();
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    })
});

// Remove dog medication for specific dog
dogMedicationRouter.delete('/:medicationid', jwtPassportMiddleware, (req, res) => {
  DogMedication.findByIdAndRemove(req.params.medicationid)
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      return res.status(500).json(err);
    })
});

module.exports = { dogMedicationRouter };
