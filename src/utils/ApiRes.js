class ApiResponse {
    constructor(status, data, message = 'Success') { // Fixed parameter order to match usage
        this.status = status;
        this.data = data;
        this.message = message;
        this.success = status < 400; // Fixed variable name from statusCode to status
    }
}

export { ApiResponse };