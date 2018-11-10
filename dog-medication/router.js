// const express = require('express');
// const Joi = require('joi');
//
// const dogMedicationRouter = express.Router();
//
// const { jwtPassportMiddleware } = require('../auth/strategy');
// const { DogMedication, DogMedicationJoiSchema } = require('./model');
//
// // Create new dog medication
// dogMedicationRouter.post('/', jwtPassportMiddleware, (req, res) => {
//   const newDogMedication = {
//     dog: req.dog.id,
//     name: req.body.name,
//     medicationDays: req.body.medicationDays,
//     medicationTime: req.body.medicationTime,
//     medicationDescription: req.body.medicationDescription
//   };
//
//   // Checks that all provided data passes all schema requirements
//   const validation = Joi.validate(newDogMedication, DogMedicationJoiSchema);
//   if (validation.error) {
//     return res.status(422).json({ error: validation.error });
//   }
//
//   // Creates a new instance of a dog's medication
//   DogMedication.create(newDogMedication)
//     .then(createDogMedication => {
//       return res.status(201).json(createDogMedication.serialize());
//     })
//     .catch(err => {
//       return res.status(500).json(err);
//     });
// })
//
// module.exports = { dogMedicationRouter };
