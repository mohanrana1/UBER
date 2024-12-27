import { Router } from "express";
import { registerCaptain, loginCaptain, logoutCaptain, getCaptainProfile } from "../controllers/captain.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";  
import { body } from "express-validator";


const router = Router();

router.post('/register',[
    body('email').isEmail().withMessage('Invalid Message'),
    body('fullname.firstname').isLength({min: 3}).withMessage('First Name should be at least 3 character long'),
    body('fullname.lastname').isLength({min: 3}).withMessage('Last Name should be at least 3 character long'),
    body('password').isLength({min: 6}).withMessage('Password should be at least 6 character long'),
    body('vechile.color').isLength({min: 3}).withMessage('Color should be at least 3 character long'),
    body('vechile.plate').isLength({min: 3}).withMessage('Vecile plate no should be at least 3 character long'),
    body('vechile.capacity').isLength({min: 1}).withMessage('Vechile Capacity must be at least one'),
    body('vechile.vechileType').isIn(['car','motorcycle', 'auto']).withMessage('Vehile Type should be  one of these types')
],
registerCaptain
);


router.route('/login',[
    body('email').isEmail().withMessage('Invalid Message'),
    body('password').isLength({min: 6}).withMessage('Password should be at least 6 character long'),  
]
).post(loginCaptain);

router.route('/logout').get(verifyJWT, logoutCaptain);

router.route('/profile').get(verifyJWT, getCaptainProfile);

// router.route('/refresh-token').get(verifyJWT, refreshAccessToken );

// router.route("/change-password").post(verifyJWT , changeCurrentPassword)

// router.route("/update-account").patch(verifyJWT, updateAccountDetails)

export default router;