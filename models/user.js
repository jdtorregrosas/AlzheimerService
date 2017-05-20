const Joi = require('joi');

const User = Joi.object().keys({
  Profile: {
    address: Joi.string(),
    birthdate: Joi.string(),
    cellphone: Joi.string(),
    firstname: Joi.string(),
    gender: Joi.string(),
    lastname: Joi.string(),
    maritalStatus: Joi.string(),
    telephone: Joi.string()
  },
  Auth: {
    email: Joi.string().email(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  }
});

const UserWOCredentials = Joi.object().keys({
    names: Joi.string().required(),
    lastnames: Joi.string().required(),
    birthyear: Joi.number().integer().min(1900).max(2013),
    email: Joi.string().email()
});
/*
{
  username: 'test-user',
  password: '1234',
  names: 'Pedro',
  lastnames: 'Navajas',
  birthyear: 1998,
  email: 'pedro@test.com'
}
*/
exports.validateUser = (user) => new Promise(function(resolve, reject) {
  Joi.validate(user, User, function (err, value) {
    if(err){
      reject(err);
    } else {
      resolve(value);
    }
  });
});

exports.validateUserWOCredentials = (user) => new Promise(function(resolve, reject) {
  Joi.validate(user, UserWOCredentials, function (err, value) {
    if(err){
      reject(err);
    } else {
      resolve(value);
    }
  });
});
