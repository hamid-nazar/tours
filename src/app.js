const express = require("express")
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }


app.use(express.json());

app.use((req, res, next) => {
    console.log("Comming from the middleware");
    next();
})

app.use("/tours",tourRouter);
app.use("/users",userRouter);


module.exports = app;