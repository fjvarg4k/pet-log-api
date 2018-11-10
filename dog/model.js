const mongoose = require('mongoose');
const Joi = require('joi');

const dogSchema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  name: {type: String, required: true},
  breed: {type: String, default: ''},
  weight: {type: Number, default: 0},
  gender: {type: String, required: true},
  age: {type: Number, default: 0},
  vetInfo: {
    vetName: {type: String, default: ''},
    vetLocationName: {type: String, default: ''},
    address: {type: String, default: ''}
  }
});

// Defines an instance of a dog
dogSchema.methods.serialize = function() {

  return {
    id: this._id,
    user: this.user,
    name: this.name,
    breed: this.breed,
    weight: this.weight,
    gender: this.gender,
    age: this.age,
    medication: this.medication,
    vetInfo: this.vetInfo
  };
}

// Checks that data provided when creating new dog is valid
const DogJoiSchema = Joi.object().keys({
  user: Joi.string().optional(),
  name: Joi.string().trim(),
  breed: Joi.string().trim().allow(''),
  weight: Joi.number(),
  gender: Joi.string().trim(),
  age: Joi.number(),
  vetInfo: Joi.object().keys({
    vetName: Joi.string().trim().allow(''),
    vetLocationName: Joi.string().trim().allow(''),
    address: Joi.string().trim().allow('')
  }).allow(null)
});

const Dog = mongoose.model('dog', dogSchema);
module.exports = { Dog, DogJoiSchema };
