const mongoose = require('mongoose');
const Joi = require('joi');

const dogMedicationSchema = mongoose.Schema({
  dog: {type: mongoose.Schema.Types.ObjectId, ref: 'dog'},
  name: {type: String, required: true},
  medicationDays: {type: String, default: ''},
  medicationTime: {type: String, default: ''},
  medicationDescription: {type: String, default: ''}
});

// Defines an instance of a dog's medication

dogMedicationSchema.methods.serialize = function() {
  return {
    id: this._id,
    dog: this.dog,
    name: this.name,
    medicationDays: this.medicationDays,
    medicationTime: this.medicationTime,
    medicationDescription: this.medicationDescription
  }
}

// Checks that data provided when creating new dog medication is valid
const DogMedicationJoiSchema = Joi.object().keys({
  dog: Joi.string().optional(),
  name: Joi.string().trim().min(1),
  medicationDays: Joi.string().trim().allow(''),
  medicationTime: Joi.string().trim().allow(''),
  medicationDescription: Joi.string().trim().allow('')
});

const DogMedication = mongoose.model('medication', dogMedicationSchema);

module.exports = { DogMedication, DogMedicationJoiSchema };
