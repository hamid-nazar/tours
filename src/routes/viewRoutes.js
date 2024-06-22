const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");
const bookingController = require("./../controllers/bookingController");

const viewRouter = express.Router();


viewRouter.get("/",bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
viewRouter.get("/tour/:slug",authController.isLoggedIn, viewsController.getTour);
viewRouter.get("/login",authController.isLoggedIn,viewsController.getLoginForm);
viewRouter.get("/me",authController.protect, viewsController.getAccount);
viewRouter.patch("/update-me",authController.protect, viewsController.updateUserData);
viewRouter.get("/my-tours",authController.protect, viewsController.getMyTours);
// viewRouter.get("/signup",viewsController.getSignupForm);




module.exports = viewRouter