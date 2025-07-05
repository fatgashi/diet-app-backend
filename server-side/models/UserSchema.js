const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: [2, '(`{PATH}`) `{VALUE}` is shorter than the minimum allowed length (2).']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    },
    discountOffer: {
        startTime: { type: Date, default: null },
        isActive: { type: Boolean, default: false }
    },
    suspended: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;