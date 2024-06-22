const express = require("express")
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require('cors');

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const booking = require("./routes/bookingRoutes");
const appError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const bookingController = require("./controllers/bookingController");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
// Serving static files
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(helmet());


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }


const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
  });
  
  app.use("/api", limiter);

 
// app.post('/webhook-checkout', bodyParser.raw({ type: 'application/json' }), async function (req, res) {

//     const signature = req.headers['stripe-signature'];
//     let event;
//    event = await stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

//    console.log(event.type);

//     res.status(200).json({ received: true });
// });

app.post("/webhook-checkout", bodyParser.raw({ type: "application/json" }), bookingController.webhookCheckout);  


app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(hpp({
    whitelist: ["duration", "ratingsAverage", "ratingsQuantity", "maxGroupSize", "difficulty", "price"]
  }));
 
app.use((req, res, next) => {
    console.log("Hello from the middleware in app.js\n");
    // console.log(req.cookies);

    next();
  });


app.use("/",viewRouter);
app.use("/api/tours",tourRouter);
app.use("/api/users",userRouter);
app.use("/api/reviews",reviewRouter);
app.use("/api/bookings",booking);


app.all("*",(req,res,next)=>{
    
    next(new appError(`Cannot find route:${req.originalUrl} on this server`,404));
});

app.use(globalErrorHandler);

module.exports = app;