const express = require("express");
const tourController = require("./../controllers/tourController");
const middlewares = require("../middleware/middlewares");
const authController = require("./../controllers/authController");

const reviewRouter = require('./reviewRoutes');

const router = express.Router();


router.use("/:tourId/reviews", reviewRouter);


router.route("/")
.post(authController.protect,authController.restrictTo("admin", "lead-guide"), tourController.createTour)
.get(tourController.getAllTours);

router.route("/:id")
.get(tourController.getTour)
.patch(authController.protect, authController.restrictTo("admin", "lead-guide"),  tourController.updateTour)
.delete(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.deleteTour);

router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(tourController.getToursWithin);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router.route("/top-5-cheap")
.get(middlewares.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats")
.get(tourController.getTourStats);

router.route("/monthly-plan/:year")
.get(authController.protect, authController.restrictTo("admin", "lead-guide", "guide"), tourController.getMonthlyPlan);


module.exports = router;