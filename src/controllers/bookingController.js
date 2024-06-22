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
        mode: 'payment', 
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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

async function webhookCheckoutHandler(req, res, next) {   

    const signature = req.headers['stripe-signature'];

    let event;

    const endpointSecret = "whsec_fb343a4d09a9be70eca81c2f0c89793abf57efb5ed32460c88fa2f0a9f2e8abc";
    try {

        event = await stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
     
    } catch (err) {

        return res.status(400).send(`Webhook error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {

        console.log(event.data.object);

       await createBookingFromCheckoutSession(event.data.object);
    }
    res.status(200).json({
        received: true
    });
}


async function createBookingFromCheckoutSession(session) {

    const tour = session.client_reference_id;

    const user = (await User.findOne({email: session.customer_email})).id;

    const price = session.amount_total / 100;

    console.log(tour, user, price);

    await Booking.create({tour, user, price});

    
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
const webhookCheckout = catchAsync(webhookCheckoutHandler);

const createBooking = catchAsync(createBookingHandler);
const getAllBookings = catchAsync(getAllBookingsHandler);
const getBooking = catchAsync(getBookingHandler);
const deleteBooking = catchAsync(deleteBookingHandler);
const updateBooking = catchAsync(updateBookingHandler);

module.exports = {
    getCheckoutSession,
    webhookCheckout,
    createBooking,
    getAllBookings,
    getBooking,
    deleteBooking,
    updateBooking
}