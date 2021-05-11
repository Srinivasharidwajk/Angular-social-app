const express = require('express');
const router = express.Router();
const { body , validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate');

/*
    @usage : Register a User
    @path : /api/users/register
    @fields : name , email , password
    @method : POST
    @access : PUBLIC
 */
router.post('/register' , [
   body('name').notEmpty().withMessage('Name is Required'),
   body('email').notEmpty().withMessage('Email is Required'),
   body('password').notEmpty().withMessage('Password is Required'),
] , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors : errors.array()});
    }
    try {
        let {name , email , password} = request.body;
        console.log(name ,email , password);
        // check if user exists
        let user = await User.findOne({email : email});
        if(user){
            return response.status(401).json({errors : [
                    { msg : 'User Already Exists'}
                ]});
        }
        // encrypt the password
        let salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password , salt);

        // avatar url
        let avatar = gravatar.url(email , {
            s : '300',
            r : 'pg',
            d : 'mm'
        });

        // store to db
        user = new User({name , email , password , avatar });
        await user.save();
        await response.status(200).json({msg : 'Registration is Success'});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Login a User
    @path : api/users/login
    @fields : email , password
    @method : POST
    @access : PUBLIC
 */
router.post('/login' , [
    body('email').notEmpty().withMessage('Email is Required'),
    body('password').notEmpty().withMessage('Password is Required'),
] , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors : errors.array()});
    }

    try {
       let {email , password} = request.body;
       // check user is exists
       let user = await User.findOne({email : email});
       if(!user){
           return response.status(401).json({errors : [{msg : 'Invalid Credentials'}]});
       }
       // check password match
       let isMatch = await bcrypt.compare(password , user.password);
       if(!isMatch){
           return response.status(401).json({errors : [{msg : 'Invalid Credentials'}]});
       }
       // create a token
       let payload = {
           user : {
               id : user.id,
               name : user.name
           }
       };
        jwt.sign(payload , process.env.JWT_SECRET_KEY,{expiresIn: 3600000000000}, (err , token) => {
            if(err) throw err;
            response.status(200).json({
                msg : 'Login Success',
                token : token
            });
        });

    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Get User Info
    @path : /api/users/
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
router.get('/' , authenticate,  async (request , response) => {
    try {
        let user = await User.findById(request.user.id).select('-password');
        await response.status(200).json({user : user});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

module.exports = router;