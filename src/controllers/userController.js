const multer = require('multer');
const sharp = require('sharp');

const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const utilFunctions = require("../utils/utilFunctions");



// const storage = multer.diskStorage({destination:
//     function (req, file, cb) {
//         cb(null, 'src/public/img/users');
//     },
//     filename: function (req, file, cb) {

//         const extention = file.mimetype.split("/")[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
//     }
// });


const storage = multer.memoryStorage();

function fileFilter(req, file, cb){

    if(file.mimetype.startsWith("image")) {
        cb(null, true);

    } else {
        cb(new AppError("Not an image! Please upload only images", 400), false);
    }
}


const upload = multer({storage: storage, fileFilter: fileFilter});

const uploadUserPhoto = upload.single('photo');

async function resizeUserPhotoHandler(req, res, next) {

    if(!req.file) {
        return next();
    }
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`src/public/img/users/${req.file.filename}`);

    console.log("file: ",req.file.filename);
    return next();
}

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
    console.log(req.file);
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400));
    }

    const filteredBody = utilFunctions.filterObject(req.body, "name", "email");

    if(req.file){

        filteredBody.photo = req.file.filename;
    }

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

async function getMeHandler(req, res, next) {

    const user = await User.findById(req.user._id);

    res.status(200).json({  
        status:"success",
        data:{
            user
        }
    })
}

const createUser = catchAsync(createUserHandler);
const getAllUsers = catchAsync(getAllUsersHandler);
const getUser = catchAsync(getUserHandler);
const updateUser = catchAsync(updateUserHandler);
const deleteUser = catchAsync(deleteUserHandler);
const updateMe = catchAsync(updateMeHandler);
const deleteMe = catchAsync(deleteMeHandler);
const getMe = catchAsync(getMeHandler);
const resizeUserPhoto = catchAsync(resizeUserPhotoHandler);

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto
}