class ApiError extends Error{
    constructor(
        StatusCode,
        errors =[],
        message = 'Something went wrong',
        stack =''
    ){
        super(message)
        this.StatusCode = StatusCode
        this.errors = errors
        this.message = message
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }

}
export {ApiError}