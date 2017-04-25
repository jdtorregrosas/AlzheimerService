const Joi = require('joi');

const AuthUser = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
});

const ChangePassword = Joi.object().keys({
    oldPassword:  Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    newPassword:  Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
});
exports.validateAuthUser = (user) => new Promise(function(resolve, reject) {
  Joi.validate(user, AuthUser, function (err, value) {
    if(err){
      reject(err);
    } else {
      resolve(value);
    }
  });
});

exports.validateChangePassword = (user) => new Promise(function(resolve, reject) {
  Joi.validate(user, ChangePassword, function (err, value) {
    if(err){
      reject(err);
    } else {
      resolve(value);
    }
  });
});
