var mongoose = require('mongoose');

module.exports = mongoose.model('users', {
  email: {type: String, default: ''},
  password: {type: String, default: ''},
  admin: {type: Boolean, default: false},
  tmpPass: {type: String, default: undefined},
  tmpPassExp: { type: String , default: undefined}
});
