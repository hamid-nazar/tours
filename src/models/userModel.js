const mongoose = require('mongoose');

const schema = mongoose.Schema({});

const User = mongoose.model('User',schema);


module.exports = User;