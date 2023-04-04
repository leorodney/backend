import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';

export const registerRoute = async (req: Request, res: Response)=>{
    const {firstname, lastname, email, username, password} = req.body;

    try{
        if(await User.findOne({email: { $eq: email }})){
            return res.status(409).json({message: `User with email: ${email}, already exists`});
        }
        if(await User.findOne({username: { $eq: username }}).setOptions({sanitizeFilter: true})){
            return res.status(409).json({message: `User with username: ${username}, already exists`});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({firstname, lastname, email, username, password: hashedPassword});
        user.save();
        req.session.user = {
            authenticated: true,
            username: user.username,
            uid: user._id
        };
        req.session.save((err)=>{
            if(err){
                console.error(err);
            }
        });
        res.status(201).json({message: 'User created successfully'});
    }
    catch(error){
        console.log(error);
        res.status(500).send();
    }
};
