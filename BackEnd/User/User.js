const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/Lore')
    .then(() => console.log('mongodb://localhost:27017/Lore'))
    .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    googleId: String,
    isGoogle: {type: Boolean, default: false},
    verification: String,
});

module.exports = mongoose.model('User', UserSchema);