const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/Testosterone')
    .then(() => console.log('mongodb://localhost:27017/Testosterone'))
    .catch(err => console.log(err));

const taskSchema = new mongoose.Schema({
    taskId: String,
    date: Date,
    progress: Number,
    checked: [String]
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true
    },
    password: String,
    googleId: String,
    isGoogle: {type: Boolean, default: false},
    verification: String,
    dateCreated: {
        type: Date,
        default: Date.now
    },
    tasks: [taskSchema],
});

module.exports = mongoose.model('User', userSchema);