const mongoose = require('mongoose');
const { Schema } = mongoose;

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

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
    password: { 
        type: String, 
        required: true,  
        minlength: [8, '(`{PATH}`) `{VALUE}` is shorter than the minimum allowed length (8).'],
    },
    role: { 
        type: String, 
        enum: ['client', 'admin'], 
        default: 'client' 
    },
    suspended: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.name = capitalizeFirstLetter(this.name);
    }
    if (this.isModified('surname')) {
        this.surname = capitalizeFirstLetter(this.surname);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;