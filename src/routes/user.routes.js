import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import { ApiError } from "../utils/apiError.js";
import { RegisterUser
    ,LoginUser
    ,LogoutUser
    ,refreshedAccessToken
} from '../controllers/user.controller.js'
import { verifyJWT } from "../middleware/auth.middleware.js";
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

//Secure routes

router.route('/logout').post(verifyJWT,LogoutUser);
router.route('/refresh-token').get(refreshedAccessToken);
export default router;