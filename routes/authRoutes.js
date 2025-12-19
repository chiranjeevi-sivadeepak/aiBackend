import express from 'express';
import registerController from '../controller/registerController.js';
import loginController from '../controller/loginController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/register', registerController);

router.post('/login',loginController);

router.get("/home",verifyToken,(req,res)=>{
    res.json({
        message:"Token verified. Welcome to the Home Page!",
        userId:req.user.id
    });
});

export default router;