const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


async function getAllReviewsHandler(req, res) {

    let filter = {};

    if(req.params.tourId){
        filter = {tour: req.params.tourId}
    }

    const reviews = await Review.find(filter);

    res.status(200).json({
        status:"success",
        results:reviews.length,
        data:{
            reviews
        }
    })
}

async function createReviewHandler(req, res) {  
    
    if(!req.body.tour){
        req.body.tour = req.params.tourId;
    }
    
    if(!req.body.user){
        req.body.user = req.user.id;
    }

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status:"success",
        data: {
            review:newReview
        }
    });
}

async function getReviewHandler(req, res) {

    const review = await Review.findById(req.params.id);

    res.status(200).json({
        status:"success",
        data: {
            review
        }
    });
}

async function updateReviewHandler(req, res) {

    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status:"success",
        data: {
            review
        }
    });
}

async function deleteReviewHandler(req, res) {  

    await Review.findByIdAndDelete(req.params.id);  

    res.status(204).json({
        status:"success",
        data: null
    });
}





const getAllReviews = catchAsync(getAllReviewsHandler);
const createReview = catchAsync(createReviewHandler);
const getReview = catchAsync(getReviewHandler);
const updateReview = catchAsync(updateReviewHandler);
const deleteReview = catchAsync(deleteReviewHandler);




module.exports ={
    getAllReviews,
    createReview,
    getReview,
    updateReview,
    deleteReview
}