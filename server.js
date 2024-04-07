const mongoose = require('mongoose');
const app = require('./src/app');
const dotenv = require('dotenv');




dotenv.config();

console.log(process.env.DATABASE_LOCAL);


mongoose.connect(process.env.DATABASE_LOCAL, {})
.then(function () {

    console.log("Successfully connected to the database");})

.catch(function (err) {

    console.log("Could not connect to the database. Exiting now...", err);

    process.exit();
});



const port = process.env.PORT || 8000;


app.listen(port, () => {
    console.log(`Server running on port ${port}...`)
})