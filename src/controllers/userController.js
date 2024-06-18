const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const utilFunctions = require("../utils/utilFunctions");


async function createUserHandler(req, res) {
    console.log(req.body);
    const newUser = await User.create(req.body);

    res.status(201).json({
        status:"success",
        data:{
            user:newUser
        }
    })
}

async function getAllUsersHandler(req, res) {

    const users = await User.find();

    res.status(200).json({
        status:"success",
        results:users.length,
        data:{
            users:users
        }
    })

}


async function getUserHandler(req, res) {
    
    const user = await User.findById(req.params.id);

    res.status(200).json({
        status:"success",
        data:{
            user
        }
    })
}

async function updateUserHandler(req, res) {
      
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        upsert: true,
        runValidators: true
    });

    res.status(200).json({
        status:"success",
        data:{
            user
        }
    })
}

async function deleteUserHandler(req, res) {

    await User.findByIdAndDelete(req.params.id);

    res.status(400).json({
        status:"success",
        data:{}
    });
    
}


async function updateMeHandler(req, res, next) {

    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400));
    }

    const filteredBody = utilFunctions.filterObject(req.body, "name", "email");

    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status:"success",
        message:"User updated successfully",
        data:{
            user:updatedUser
        }
    });

}

async function deleteMeHandler(req, res, next) {

    await User.findByIdAndUpdate(req.user._id, {active:false});

    res.status(204).json({
        status:"success",
        message:"User deleted successfully",
        data: null
    });
}

const createUser = catchAsync(createUserHandler);
const getAllUsers = catchAsync(getAllUsersHandler);
const getUser = catchAsync(getUserHandler);
const updateUser = catchAsync(updateUserHandler);
const deleteUser = catchAsync(deleteUserHandler);
const updateMe = catchAsync(updateMeHandler);
const deleteMe = catchAsync(deleteMeHandler);

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe
}