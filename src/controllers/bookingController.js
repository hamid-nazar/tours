const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");


async function getCheckoutSessionHandler(req, res, next) {

    const tour = await Tour.findById(req.params.tourId);


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment', // Add the mode parameter here
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100, // Ensure the amount is in cents
                    product_data: {
                        name: tour.name,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
                quantity: 1,
            },
        ],
    });


    res.status(200).json({
        status:"success",
        session
    });
}   

async function createBookingCheckoutHandler(req, res, next) {

    const {tour, user, price} = req.query;
    
    if(!tour && !user && !price) {
        return next();
    }

    const booking = await Booking.create({
        tour,
        user,
        price
    });

    res.redirect(req.originalUrl.split('?')[0]);
}

async function createBookingHandler(req, res, next) { 
    
    const booking = await Booking.create({ ...req.body});
    
    res.status(200).json({
        status:"success",
        data:{
            booking
        }
    })
}

async function getAllBookingsHandler(req, res, next) {

    const bookings = await Booking.find();

    res.status(200).json({
        status:"success",
        results:bookings.length,
        data:{
            bookings
        }
    })
}

async function getBookingHandler(req, res, next) {

    const booking = await Booking.findById(req.params.id);  

    res.status(200).json({
        status:"success",
        data:{
            booking
        }
    })
}

async function deleteBookingHandler(req, res, next) {

    const booking = await Booking.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status:"success",
        data:{
            booking
        }
    })
}

async function updateBookingHandler(req, res, next) {

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status:"success",
        data:{
            booking
        }
    })
}


const getCheckoutSession = catchAsync(getCheckoutSessionHandler);
const createBookingCheckout = catchAsync(createBookingCheckoutHandler);
const createBooking = catchAsync(createBookingHandler);
const getAllBookings = catchAsync(getAllBookingsHandler);
const getBooking = catchAsync(getBookingHandler);
const deleteBooking = catchAsync(deleteBookingHandler);
const updateBooking = catchAsync(updateBookingHandler);

module.exports = {
    getCheckoutSession,
    createBookingCheckout,
    createBooking,
    getAllBookings,
    getBooking,
    deleteBooking,
    updateBooking
}