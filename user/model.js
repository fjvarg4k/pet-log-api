const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true}
});

// Defines an instance of a User
userSchema.methods.serialize = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username
  }
};

// Takes provided password and hashes it
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

// Takes provided password and stored password and makes sure that they are the same
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Checks that data provided when creating new User is valid
const UserJoiSchema = Joi.object().keys({
  firstName: Joi.string().min(1).trim().required(),
  lastName: Joi.string().min(1).trim().required(),
  username: Joi.string().min(4).trim().required(),
  password: Joi.string().min(8).max(72).trim().required()
});

const User = mongoose.model('user', userSchema);

module.exports = { User, UserJoiSchema };
