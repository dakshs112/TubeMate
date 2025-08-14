import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import { ApiError } from "../utils/apiError.js";
import { RegisterUser,LoginUser,LogoutUser } from '../controllers/user.controller.js'
const router = Router();
router.route('/register').post(
   upload.fields([
    { 
        name: 'Avatar',
         maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
   ]),
    RegisterUser);
router.route('/login').post(LoginUser)
router.route('/logout').post(LogoutUser);
export default router;