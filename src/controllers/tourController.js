
const Tour = require('../models/tourModel');



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

        const tours = await Tour.find();

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

        const tour = await Tour.find(req.params.id);

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


module.exports = {
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour
};