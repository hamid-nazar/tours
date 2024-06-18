const express = require("express");
const tourController = require("./../controllers/tourController");
const middlewares = require("../middleware/middlewares");
const authController = require("./../controllers/authController");

const router = express.Router();

// router.param("id",middlewares.checkId);

router.route("/top-5-cheap")
.get(middlewares.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats")
.get(tourController.getTourStats);

router.route("/monthly-plan/:year")
.get(tourController.getMonthlyPlan);

router.route("/")
.post(tourController.createTour)
.get(authController.protect, tourController.getAllTours);

router.route("/:id")
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.deleteTour);


module.exports = router;