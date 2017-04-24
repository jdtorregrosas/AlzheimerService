var validateUser = require('./models/user').validateUser;
// You can also pass a callback which will be called synchronously with the validation result.
// err === null -> valid
var testUser = {
  username: 'testuser',
  password: '1234',
  names: 'Pedro',
  lastnames: 'Navajas',
  birthyear: 1998,
  email: 'pedro@test.com'
}
validateUser(testUser).then((value) => {
  console.log(value);
}).catch((err) => {
  console.log(err);
});
