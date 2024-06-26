const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bycrypt = require("bcryptjs");
const crypto = require("crypto");
const Email = require("../utils/email");



function createJwtTokenAndSend(user, statusCode, res,next) {

    const token = jwt.sign({user_id:user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
    }

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status:"success",
        token,
        data: {
            user
        }
    })
}

async function signupHandler(req, res) {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const url = `${req.protocol}://${req.get("host")}/me`;

    await new Email(newUser, url).sendWelcome();

    createJwtTokenAndSend(newUser, 201, res);
}


async function loginHandler(req, res, next) {

    const {email, password} = req.body;

    if(!email || !password) {

        return next(new AppError("Please provide email and password!", 400));
    }

    const user = await User.findOne({email:email}).select("+password");

    if(!user) {
        return next(new AppError("No user found with the given email", 401));
    }

    const isPasswordCorrect = await bycrypt.compare(password, user.password);

    if(!isPasswordCorrect) {
        return next(new AppError("Incorrect password", 401));
    }

    createJwtTokenAndSend(user, 200, res);
}


async function logoutHandler(req, res) {

    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({status:"success"});
}



async function protectHandler(req, res, next) {
  
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
  
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if(!token) {
        return next(new AppError("You are not logged in! Please log in to get access", 401));
    }
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
       
    const currentUser = await User.findById(decodedPayload.user_id);
        
    if(!currentUser) {
        return next(new AppError("The user belonging to this token does not exist", 401));
    }

    if(currentUser.passwordChangedAt) {
        const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime()/1000, 10);
       
        if(changedTimestamp > decodedPayload.iat) {
       
            return next(new AppError("User recently changed password. Please log in again", 401));
        }
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    
    next();
}

async function isLoggedInHandler(req, res, next) {

    try {
        if(req.cookies.jwt) {
            const decodedPayload = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
       
            const currentUser = await User.findById(decodedPayload.user_id);
            
            if(!currentUser) {
                return next();
            }   

            if(currentUser.passwordChangedAt) {
                const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime()/1000, 10);
               
                if(changedTimestamp > decodedPayload.iat) {
                   
                    return next();
                }
            }
       
            res.locals.user = currentUser;

            return next();
        }
       return next();
        
    } catch(err) {

      return next();
    }
}

function restrictTo(...roles) {

    return function (req, res, next){

        if(!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }

        next();
    }
}


async function forgotPasswordHandler(req, res, next) {

    const user = await User.findOne({email:req.body.email});

    if(!user) {
        return next(new AppError("There is no user with the provided email", 404));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   
    await user.save({validateBeforeSave: false});

    
    try {

        const resetURL = `${req.protocol}:/${req.get("host")}/api/users/reset-password/${resetToken}`;
        
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status:"success",
            message: "Token sent to your email"
        })

    } catch (error) {

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});   

        return next(new AppError("There was an error sending the email. Try again later", 500));
    }

}


async function resetPasswordHandler(req, res, next) {

    const hashedresetToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({passwordResetToken:hashedresetToken, passwordResetExpires:{$gt:Date.now()}});

    if(!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }
    
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    createJwtTokenAndSend(user, 200, res);
}

async function updatePasswordHandler(req, res, next) {
    
    const user = await User.findById(req.user._id).select("+password");
   
    const {currentPassword, newPassword, newPasswordConfirm} = req.body;

    if(!currentPassword || !newPassword || !newPasswordConfirm) {
        return next(new AppError("Please provide current password, new password and confirm new password", 400));
    }

    const isPasswordCorrect = await bycrypt.compare(currentPassword, user.password);
    
    if(!isPasswordCorrect) {
        return next(new AppError("Your current password is wrong", 401));   
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    createJwtTokenAndSend(user, 200, res);
}



const signup = catchAsync(signupHandler);
const login = catchAsync(loginHandler);
const logout = catchAsync(logoutHandler);
const protect = catchAsync(protectHandler);
const forgotPassword = catchAsync(forgotPasswordHandler);
const resetPassword = catchAsync(resetPasswordHandler);
const updatePassword = catchAsync(updatePasswordHandler);
const isLoggedIn = catchAsync(isLoggedInHandler);



module.exports = {
    signup,
    login,
    logout,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLoggedIn
}

