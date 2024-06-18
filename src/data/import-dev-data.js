const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const Tour = require("./../models/tourModel");



dotenv.config({
    path: `${__dirname}/../../.env`
});


console.log(process.env.MONGODB_CLOUD_URL);


const DB = process.env.MONGODB_CLOUD_URL;

console.log(DB);

mongoose.connect(DB, {})
.then(function(){

    console.log("Connected to the database successfully");

}).catch(function(err){

    console.log("Could not connect to the database. Exiting now...", err);
});

console.log(__dirname);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf8"));


async function loadDataToDB() {
    try {

         await Tour.create(tours);

        console.log("Data successfully loaded");

    } catch (error) {
        console.log(error);
    } finally {
        process.exit(0);
    }
}



async function deleteDataFromDB() {

    try {

        await Tour.deleteMany();

        console.log("Data successfully deleted");
        
    } catch (err) {
        console.log(err);
    }finally {
        process.exit(0);
    }
}

if (process.argv[2] === "--import") {

    loadDataToDB();

} else if (process.argv[2] === "--delete") {

    deleteDataFromDB();
}
