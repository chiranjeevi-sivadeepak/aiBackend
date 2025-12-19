
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const registerController = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already Exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({message:"User registered successfully"});
        } catch (err) {
            res.status(500).json({message:"Server Error"});
        }
}

export default registerController;