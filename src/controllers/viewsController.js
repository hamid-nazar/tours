const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");


async function getOverviewHandler(req, res, next) {

     const tours = await Tour.find();
     
    res.status(200).render("overview", {
        title:"All Tours",
        tours:tours
    });
}

async function getTourHandler(req, res, next) {

    const tour = await Tour.findOne({slug:req.params.slug}).populate({path:"reviews", select:"review rating user"});

    if(!tour) {
        return next(new appError("There is no tour with that name", 404));
    }

    res.status(200).render("tour", {
        title:`${tour.name} tour`,
        tour:tour
    });
}

function getLoginForm(req, res, next) {

    res.status(200).render("login", {
        title:"Log into your account"
    });
}

function getAccount(req, res, next) {
    res.status(200).render("account", {
        title:"Your account"
    });
}

async function updateUserDataHandler(req, res, next) {

    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).render("account", {
        title:"Your account",
        user:updatedUser
    });
}



const getOverview = catchAsync(getOverviewHandler);
const getTour = catchAsync(getTourHandler);
const updateUserData = catchAsync(updateUserDataHandler);




module.exports = {
    getOverview,
    getTour,
    getLoginForm,
    getAccount,
    updateUserData
}