const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo:{
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
        message: 'Role should be either: user, guide, lead-guide or admin'
    },
    password: {
        type: String,   
        required: [true, 'Please provide a password'],
        minlength: 8 ,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});


userSchema.pre('save', async function(next) {

    if(!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
});


userSchema.pre('save', function(next) {
    
    if(!this.isModified('password') || this.isNew) {
        return next();
    }   

    this.passwordChangedAt = Date.now() - 1000;
    next();
});


userSchema.pre(/^find/, function(next) {
    this.find({active: {$ne: false}});
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;