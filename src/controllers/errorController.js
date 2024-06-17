const AppError = require("./../utils/appError");


function devErrorHandler(err, res) {

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}

function prodErrorHandler(err, res) {

    if (err.isOperational) {

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })

    } else {
        
        console.log("Error occured: ", err);

        res.status(500).json({
            status: "error",
            message: "Something went wrong"
        })
    }
}

function databaseErrorHandler(err) {

    if (err.code === 11000) {

        const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

        const message = `Duplicate field value: ${value}. Please enter a different value`;
        return new AppError(message, 400);

    } else if (err.name === "ValidationError") {

        const errors = Object.values(err.errors).map(el => el.message);

        const message = `Invalid input data. ${errors.join('. ')}`;
       
        return new AppError(message, 400);

    } else if (err.name === "CastError") {

        const message = `Invalid ${err.path}: ${err.value}`;
        return new AppError(message, 400);
    }

}


function globalErrorHandler(err, req, res, next) {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {

        devErrorHandler(err, res);

    } else if (process.env.NODE_ENV === "production") {

        const  error = {...err};

        if (error.name === "CastError" || error.name === "ValidationError" || error.code === 11000) {

            error = databaseErrorHandler(error);
        }

        prodErrorHandler(error, res);
    }

}

module.exports = globalErrorHandler