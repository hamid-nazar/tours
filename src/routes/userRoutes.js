const express = require("express");
const userController = require("./../controllers/userController");
const middlewares = require("../middleware/middlewares");
const authController = require("./../controllers/authController");

const router = express.Router();


router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);


router.use(authController.protect); // Protect all routes after this middleware


router.patch("/update-password", authController.updatePassword);
router.patch("/update-me", userController.updateMe);
router.delete("/delete-me", userController.deleteMe);
router.get("/me", userController.getMe);


router.use(authController.restrictTo("admin")); // Restrict all routes after this middleware to admin only

router.route("/")
.get(userController.getAllUsers)
.post(userController.createUser);

router.route("/:id")
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = router;