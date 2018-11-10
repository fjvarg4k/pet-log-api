const mongoose = require('mongoose');
const Joi = require('joi');

const dogMedicationSchema = mongoose.Schema({
  name: {type: String, default: ''},
  medicationDays: {type: String, default: ''},
  medicationTime: {type: String, default: ''},
  medicationDescription: {type: String, default: ''}
});

const dogSchema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  // dogImage: {type: String, default: ''},
  name: {type: String, required: true},
  breed: {type: String, default: ''},
  weight: {type: Number, default: 0},
  gender: {type: String, required: true},
  age: {type: Number, default: 0},
  medication: [dogMedicationSchema],
  vetInfo: {
    vetName: {type: String, default: ''},
    vetLocationName: {type: String, default: ''},
    address: {type: String, default: ''}
  }
});

// Defines an instance of a dog
dogSchema.methods.serialize = function() {
  // let user
  // if (typeof this.user === 'function') {
  //   user = this.user.serialize();
  // } else {
  //   user = this.user;
  // }

  return {
    id: this._id,
    user: this.user,
    // dogImage: this.dogImage,
    name: this.name,
    breed: this.breed,
    weight: this.weight,
    gender: this.gender,
    age: this.age,
    medication: this.medication,
    vetInfo: this.vetInfo
  };
}

// Checks that data provided when creating new dog medication is valid
const DogMedicationJoiSchema = Joi.object().keys({
  name: Joi.string().trim().allow(''),
  medicationDays: Joi.string().trim().allow(''),
  medicationTime: Joi.string().trim().allow(''),
  medicationDescription: Joi.string().trim().allow('')
});

// Checks that data provided when creating new dog is valid
const DogJoiSchema = Joi.object().keys({
  user: Joi.string().optional(),
  // dogImage: Joi.string()
  name: Joi.string().trim(),
  breed: Joi.string().trim().allow(''),
  weight: Joi.number(),
  gender: Joi.string().trim(),
  age: Joi.number(),
  // medication: DogMedicationJoiSchema,
  vetInfo: Joi.object().keys({
    vetName: Joi.string().trim().allow(''),
    vetLocationName: Joi.string().trim().allow(''),
    address: Joi.string().trim().allow('')
  }).allow(null)
});

const Dog = mongoose.model('dog', dogSchema);
module.exports = { Dog, DogJoiSchema, DogMedicationJoiSchema };
