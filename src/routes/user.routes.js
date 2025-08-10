import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import { ApiError } from "../utils/apiError.js";
import { RegisterUser } from '../controllers/user.controller.js'
const router = Router();
router.post('/register', 
   upload.fields([
    { 
        name: 'Avatar',
         maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
   ]),
    RegisterUser);
export default router;