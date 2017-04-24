const Joi = require('joi');

const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
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
  Joi.validate(user, schema, function (err, value) {
    if(err){
      reject(err);
    } else {
      resolve(value);
    }
  });
});
