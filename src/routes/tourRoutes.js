const express = require("express");
const tourController = require("./../controllers/tourController");
const middlewares = require("../middleware/middlewares");

const router = express.Router();



router.route("/top-5-cheap")
.get(middlewares.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats")
.get(tourController.getTourStats);

router.route("/monthly-plan/:year")
.get(tourController.getMonthlyPlan);

router.route("/")
.post(tourController.createTour)
.get(tourController.getAllTours);

router.route("/:id")
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(tourController.deleteTour);


module.exports = router;