const express = require("express")
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const appError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }


app.use(express.json());


app.use("/tours",tourRouter);
app.use("/users",userRouter);


app.all("*",(req,res,next)=>{

    next(new appError(`Cannot find route:${req.originalUrl} on this server`,404));
});

app.use(globalErrorHandler);

module.exports = app;