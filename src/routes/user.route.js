import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser , loginUser, logoutUser , getUserProfile, refreshAccessToken , changeCurrentPassword, updateAccountDetails } from "../controllers/user.controller.js"
import { body } from "express-validator";
import { Router }  from "express";

const router = Router();

router.post('/register',[
    body('email').isEmail().withMessage('Invalid Message'),
    body('fullname.firstname').isLength({min: 3}).withMessage('First Name should be at least 3 character long'),
    body('password').isLength({min: 6}).withMessage('Password should be at least 6 character long')
],
registerUser 
);

router.route('/login',[
    body('email').isEmail().withMessage('Invalid Message'),
    body('password').isLength({min: 6}).withMessage('Password should be at least 6 character long'),  
]
).post(loginUser);

router.route('/logout').get(verifyJWT, logoutUser);

router.route('/profile').get(verifyJWT, getUserProfile);

router.route('/refresh-token').get(verifyJWT, refreshAccessToken );

router.route("/change-password").post(verifyJWT , changeCurrentPassword)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)


export default router;   