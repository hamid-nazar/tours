const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');


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