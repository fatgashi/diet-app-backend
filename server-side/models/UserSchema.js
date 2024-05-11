const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {type: String, required: true, minlength: [2, '(`{PATH}`) `{VALUE}` is shorter than the minimum allowed length (2).']},
    surname: {
        type: String,
        minlength: [3, '(`{PATH}`) `{VALUE}` is shorter than the minimum allowed length (3).'],
        required: true,
    },
    username: {
        type: String,
        required: true,
        minlength: [4, '(`{PATH}`) `{VALUE}` is shorter than the minimum allowed length (4).'],
        unique: true
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['client', 'admin'], 
        default: 'client' 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;