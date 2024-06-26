const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');




const storage = multer.memoryStorage();

function fileFilter(req, file, cb){

    if(file.mimetype.startsWith("image")) {
        cb(null, true);

    } else {
        cb(new AppError("Not an image! Please upload only images", 400), false);
    }
}


const upload = multer({storage: storage, fileFilter: fileFilter});


const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1, },
    { name: 'images', maxCount: 3 }
  ]);


async function resizeTourImagesHandler (req, res, next){
    
    console.log("resize", req.files);

    if(!req.files.imageCover ){
        return next();
    }

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/img/tours/${req.body.imageCover}`);

    console.log("file name : ",req.body.imageCover);


    req.body.images = [];

    await Promise.all(
    req.files.images.map(async (file, i) => {

      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.png`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('png')
        .jpeg({ quality: 90 })
        .toFile(`src/public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

    next();
}


async function createTour(req, res){

    try {

        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status:"success",
            data:{
                tour:newTour
            }
        });

    }catch(error){

        res.status(400).json({
            status:"failed",
            message:error.message
        })
    }

}




async function getAllTours(req, res){

    try {

        const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

        const tours = await features.query;


        res.status(200).json({
            status:"success",
            results:tours.length,
            data:{
                tours
            }
        });
        
    } catch (error) {

        res.status(404).json({
            status:"failed",
            message:error.message
        })
        
    }

}



async function getTour(req, res){

    try {
        const tour = await Tour.findById(req.params.id).populate("reviews");

        res.status(200).json({
            status:"success",
            data:{
                tour
            }
        });


    } catch (error) {

        res.status(404).json({
            status:"failed",
            message:error.message
        })
        
    }

}

async function updateTour(req, res){
    console.log("her", req.body);
    try {
        
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{new:true, runValidators:true});

        res.status(200).json({
            status:"success",
            data:{
                tour
            }
        });
        
    } catch (error) {

        res.status(404).json({
            status:"failed",
            message:error.message
        })
    }


}

async function deleteTour(req, res){

    try {

        await Tour.findByIdAndDelete(req.params.id); 

        res.status(204).json({
            status:"success",
            data: {}
        });
        
    } catch (error) {

        res.status(404).json({
             status:"failed",
             message:error.message
            
            });
        
    }
}



async function getTourStats(req, res){

    try {

        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5}}
            },
            {
                $group: {
                    _id: "$difficulty",
                    numTours: {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            },
            {
                $sort: {avgPrice: 1}
            }
        ]);
        
        res.status(200).json({
            status:"success",
            data:{
                stats
            }
        })

    } catch (error) {
        res.status(404).json({
            status:"failed",
            message:error.message
        })
    }

}


async function getMonthlyPlan(req, res){
    try {
        
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$startDates"},
                    numTourStarts: {$sum: 1},   
                    tours: {$push: "$name"}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStarts: -1}
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            status:"success",
            data:{
                plan
            }
        }); 

    } catch (error) {
        
        res.status(404).json({
            status:"failed",
            message:error.message
        })
    }

}

async function getToursWithinHandler(req, res, next){

    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng){
        next(new AppError("Please provide latitude and longitude in the format lat,lng", 400));
    }

    const tours = await Tour.find({startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}});

    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{
            data:tours
        }
    });

}

async function getDistancesHandler(req, res, next){ 

    const {latlng, unit} = req.params;

    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        next(new AppError("Please provide latitude and longitude in the format lat,lng", 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status:"success",
        data:{
            data:distances
        }
    });
}


// const getAllTours = catchAsync(getAllTours);
// const createTour = catchAsync(createTour);
// const getTour = catchAsync(getTour);
// const updateTour = catchAsync(updateTour);
// const deleteTour = catchAsync(deleteTour);
// const getTourStats = catchAsync(getTourStats);
// const getMonthlyPlan = catchAsync(getMonthlyPlan);

const getToursWithin = catchAsync(getToursWithinHandler);
const getDistances = catchAsync(getDistancesHandler);
const resizeTourImages = catchAsync(resizeTourImagesHandler);

module.exports = {
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
    uploadTourImages,
    resizeTourImages,
};