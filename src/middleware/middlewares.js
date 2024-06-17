
function aliasTopTours(req, res, next) {
    
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

    next();
}

function checkId(req,res,next,val) {

    if(val){
        return next();
    }

    return res.status(404).json({
        status:"failed",
        message:"Invalid ID"
    })
}


module.exports = {
    aliasTopTours,
    checkId
}