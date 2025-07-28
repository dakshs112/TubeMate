const asyncHandler =(reqHandler) = () =>{
    return (req, res, next) => {
        Promise.resolve(reqHandler(req,res,next).catch(next))
        }
    }

export {asyncHandler}
//OR using async await
/* 
const asyncHandler = (function) =>async (req,res,next)=>{
    try{
    await function(req,res,next)
    }catch(error){
        res.status(500).json({
        success: false,
        message: error.message})
    }
    }
*/