const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");



async function signupHandler(req, res) {

    const newUser = await User.create(req.body);

    res.status(201).json({
        status:"success",
        data:{
            user: newUser
        }
    })
}



const signup = catchAsync(signupHandler);


module.exports = {
    signup
}