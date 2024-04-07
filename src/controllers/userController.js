
const User = require("../models/User");


async function createUser(req, res) {
    
    try {

        const user = await User.create(req.body);

        res.status(201).json({
            status: "success",
            data:{
                user
            }
        });
        

    } catch (error) {
        
        res.status(500).json({
            status:"failed",
            message:error.message,
            data:{}
        });
    }
}

async function getAllUsers(req, res) {
    
    try {
        
        const users = await User.find();

        res.status(200).json({
            status:"success",
            results:users.length,
            data:{
                users
            }
        })
    } catch (error) {

        res.status(500).json({
            status:"failed",
            message:error.message,
        });
        
    }
}


async function getUser(req, res) {
    
    try {

        const user = await User.findById(req.params.id);

        res.status(200).json({
            status:"success",
            data:{
                user
            }
        })
        
    } catch (error) {
        
        res.status(404).json({ 
            status:"failed",
            status:error.message
        });
    }
}

async function updateUser(req, res) {
      
    try {

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            upsert: true,
            runValidators: true
        });

        res.status(200).json({
            status:"success",
            data:{
                user
            }
        })
        
    } catch (error) {
        
        res.status(404).json({ 
            status:"failed",
            status:error.message
        });
    }
}

async function deleteUser(req, res) {
        
    try {

      await User.findByIdAndDelete(req.params.id);

        res.status(400).json({
            status:"success",
            data:{}
        })
        
    } catch (error) {
        
        res.status(404).json({ 
            status:"failed",
            status:error.message
        });
    }
}


module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
}