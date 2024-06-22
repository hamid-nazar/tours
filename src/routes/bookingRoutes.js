const express = require("express");

const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const bookingController = require("../controllers/bookingController");


const router = express.Router({mergeParams: true});

router.use(authController.protect);

router.get("/checkout-session/:tourId", bookingController.getCheckoutSession);


router.use(authController.restrictTo("admin", "lead-guide"));

router.route("/")
.post(bookingController.createBooking)
.get(bookingController.getAllBookings);

router.route("/:id")
.get(bookingController.getBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking);








module.exports = router