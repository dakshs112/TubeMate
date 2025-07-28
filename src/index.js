import dotenv from 'dotenv';
import {app} from './app.js';

dotenv.config({
    path: './.env'
});
import mongoose from 'mongoose';
import {DB_NAME} from './constants.js'
import connectDB from './db/index.js';
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Failed to connect to the database", err);
    
})