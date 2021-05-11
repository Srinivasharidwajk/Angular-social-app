const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const Profile = require('../models/Profile');
const User = require('../models/User');
const {body , validationResult} = require('express-validator');

/*
    @usage : Get a Profile
    @path : /api/profiles/me
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
router.get('/me' , authenticate , async (request , response) => {
    try {
        let profile = await Profile.findOne({user : request.user.id}).populate('user' , ['name' , 'avatar']);
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found'}]});
        }
        await response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Create a Profile
    @path : /api/profiles/
    @fields : company , website , location , status , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method : POST
    @access : PRIVATE
 */
router.post('/', authenticate , [
    body('company').notEmpty().withMessage('Company is Required'),
    body('website').notEmpty().withMessage('Website is Required'),
    body('location').notEmpty().withMessage('Location is Required'),
    body('designation').notEmpty().withMessage('Designation is Required'),
    body('skills').notEmpty().withMessage('Skills is Required'),
    body('bio').notEmpty().withMessage('Bio is Required'),
    body('githubUsername').notEmpty().withMessage('GithubUsername is Required')
] , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()});
    }
    try {
        // check if profile is exists
        let profile = await Profile.findOne({user : request.user.id});
        if(profile){
            return response.status(401).json({errors : [{msg : 'Profile already Exists'}]});
        }

        let {company , website , location , designation , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram} = request.body;

        let profileFields = {};

        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(designation) profileFields.designation = designation;
        if(bio) profileFields.bio = bio;
        if(githubUsername) profileFields.githubUsername = githubUsername;
        if(skills) profileFields.skills = skills.toString().split(',').map(skill => skill.trim());

        // social
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(facebook) profileFields.social.facebook = facebook;
        if(twitter) profileFields.social.twitter = twitter;
        if(instagram) profileFields.social.instagram = instagram;
        if(linkedin) profileFields.social.linkedin = linkedin;

        // add user
        profileFields.user = request.user.id;

        // save to db
        profile = new Profile(profileFields);
        profile = await profile.save();
        await response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Update a Profile
    @path : /api/profiles/
    @fields : company , website , location , status , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method : PUT
    @access : PRIVATE
 */
router.put('/', authenticate , [
    body('company').notEmpty().withMessage('Company is Required'),
    body('website').notEmpty().withMessage('Website is Required'),
    body('location').notEmpty().withMessage('Location is Required'),
    body('designation').notEmpty().withMessage('Designation is Required'),
    body('skills').notEmpty().withMessage('Skills is Required'),
    body('bio').notEmpty().withMessage('Bio is Required'),
    body('githubUsername').notEmpty().withMessage('GithubUsername is Required')
] , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()});
    }
    try {
        // check if profile is exists
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(401).json({errors : [{msg : 'Profile is Not Exists'}]});
        }

        let {company , website , location , designation , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram} = request.body;

        let profileFields = {};

        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(designation) profileFields.designation = designation;
        if(bio) profileFields.bio = bio;
        if(githubUsername) profileFields.githubUsername = githubUsername;
        if(skills) profileFields.skills = skills.toString().split(',').map(skill => skill.trim());

        // social
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(facebook) profileFields.social.facebook = facebook;
        if(twitter) profileFields.social.twitter = twitter;
        if(instagram) profileFields.social.instagram = instagram;
        if(linkedin) profileFields.social.linkedin = linkedin;

        // add user
        profileFields.user = request.user.id;
        console.log('-------------------------- Update Profile -------------------');
        console.log(profileFields);
        // update profile to db
        profile = await Profile.findOneAndUpdate({user : request.user.id} , {
            $set : profileFields
        }, {new  : true});
        await response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Get All Profiles
    @path : /api/profiles/
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
router.get('/', async (request , response) => {
    try {
        let profiles = await Profile.find().populate('user' , ['name' , 'avatar']);
        await response.status(200).json({developers : profiles});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Get a Profile of a User
    @path : /api/profiles/users/:user_id
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
router.get('/users/:user_id', async (request , response) => {
    try {
        let userId = request.params.user_id;
        let profile = await Profile.findOne({user : userId}).populate('user', ['name' , 'avatar']);
        if(!profile){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        await response.status(200).json({developer : profile});
    }
    catch (error) {
        console.error(error);
        if(error.kind === 'ObjectId'){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Delete a Profile , User , Posts
    @path : /api/profiles/users/:user_id
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/users/:user_id', authenticate , async (request , response) => {
    let userId = request.params.user_id;
    try {
        // Todo - Delete a Post too
        // check for profile
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        profile = await Profile.findOneAndRemove({user : request.user.id});

        // check for user
        let user = await User.findOne({_id : userId});
        if(!user){
            return response.status(400).json({errors : [{msg : 'User Not Found'}]});
        }
        user = await User.findOneAndRemove({_id : userId});
        await response.status(200).json({msg : 'Account Deleted'});
    }
    catch (error) {
        console.error(error);
        if(error.kind === 'ObjectId'){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Update an Experience of a Profile
    @path : /api/profiles/experience
    @fields : title , company , location , from , to , current , description
    @method : PUT
    @access : PRIVATE
 */
router.put('/experience', authenticate , [
   body('title').notEmpty().withMessage('Title is Required'),
   body('company').notEmpty().withMessage('Company is Required'),
   body('location').notEmpty().withMessage('Location is Required'),
   body('from').notEmpty().withMessage('From is Required'),
   body('description').notEmpty().withMessage('Description is Required'),
] , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()});
    }
    try {
        let experience = {
            title : request.body.title,
            company : request.body.company,
            location : request.body.location,
            from : request.body.from,
            to : request.body.to ? request.body.to : ' ',
            current : request.body.current,
            description : request.body.description,
        };
        // get the profile
        let profile  = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        // add experience to profile
        profile.experience.unshift(experience);
        profile = await profile.save();
        await response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Delete an Experience of a Profile
    @path : /api/profiles/experience/:exp_id
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/experience/:exp_id', authenticate,  async (request , response) => {
    let experienceId = request.params.exp_id;
    try {
        // get the profile
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        // get removable index
        let removableIndex = profile.experience.map(exp => exp._id).indexOf(experienceId);
        if(removableIndex !== -1){
            profile.experience.splice(removableIndex, 1);
            profile = await profile.save();
            await response.status(200).json({profile : profile});
        }
        await response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Update an Education of a Profile
    @path : /api/profiles/education
    @fields : school , degree , fieldOfStudy, from , to , current , description
    @method : PUT
    @access : PRIVATE
 */
router.put('/education', authenticate , [
    body('school').notEmpty().withMessage('School is Required'),
    body('degree').notEmpty().withMessage('Degree is Required'),
    body('fieldOfStudy').notEmpty().withMessage('FieldOfStudy is Required'),
    body('from').notEmpty().withMessage('From is Required'),
    body('description').notEmpty().withMessage('Description is Required'),
] , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()});
    }
    try {
        let education = {
            school : request.body.school,
            degree : request.body.degree,
            fieldOfStudy : request.body.fieldOfStudy,
            from : request.body.from,
            to : request.body.to ? request.body.to : ' ',
            current : request.body.current,
            description : request.body.description,
        };
        // get the profile
        let profile  = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        // add education to profile
        profile.education.unshift(education);
        profile = await profile.save();
        await response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Delete an Education of a Profile
    @path : /api/profiles/education/:edu_id
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/education/:edu_id', authenticate,  async (request , response) => {
    let educationId = request.params.edu_id;
    try {
        // get the profile
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'Profile Not Found'}]});
        }
        // get removable index
        let removableIndex = profile.education.map(edu => edu._id).indexOf(educationId);
        if(removableIndex !== -1){
            profile.education.splice(removableIndex, 1);
            profile = await profile.save();
            await response.status(200).json({profile : profile});
        }
        await response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

module.exports = router;