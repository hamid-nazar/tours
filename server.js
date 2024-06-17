process.on("uncaughtException", function (err) {
    console.log("Uncaught Exception \n:");
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
   
    process.exit(1);
})


const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
    path: `${__dirname}/.env`
});

const app = require('./src/app');


mongoose.connect(process.env.DATABASE_LOCAL, {})
.then(function () {

    console.log("Successfully connected to the database");})

.catch(function (err) {

    console.log("Could not connect to the database. Exiting now:\n", err);

    process.exit();
});



const port = process.env.PORT || 8000;


const server = app.listen(port, () => {
    console.log(`Server running on port ${port}...`)
})


process.on('unhandledRejection', function (err) {
    console.log("UNHANDLED REJECTION \n:");
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! Shutting down...');
   
    server.close(function () {
        process.exit(1);
    })
})
