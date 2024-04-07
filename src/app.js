const express = require("express")
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");



if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}

const app = express();

app.use(express.json());
app.use(tourRouter);
app.use(userRouter);


module.exports = app;