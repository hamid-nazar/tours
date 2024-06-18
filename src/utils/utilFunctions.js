
function filterObject(obj, ...allowedFields) {

    const newObj = {};
    
    Object.keys(obj).forEach(function(el){

        if(allowedFields.includes(el)){

            newObj[el] = obj[el];
        }
    });

    return newObj;
}





module.exports = {
    filterObject
}