const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const Post = require('../models/Post');
const User = require('../models/User');
const {body , validationResult} = require('express-validator');

/*
    @usage : Create a Post
    @path : /api/posts
    @fields : text
    @method : POST
    @access : PRIVATE
 */
router.post('/', authenticate , [
    body('text').notEmpty().withMessage('Text is Required')
] , async (request, response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()});
    }
    try {
        let user = await User.findById(request.user.id).select('-password');
        let newPost = {
            user : request.user.id,
            text : request.body.text,
            name : user.name,
            avatar : user.avatar
        }
        let post = new Post(newPost);
        post = await post.save();
        await response.status(200).json({post : post});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : GET all Posts
    @path : /api/posts
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
router.get('/', authenticate, async (request , response) => {
    try {
        let posts = await Post.find().sort({date : -1});
        response.status(200).json({posts : posts});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : GET a Post with post_id
    @path : /api/posts/:post_id
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
router.get('/:post_id', authenticate, async (request , response) => {
    let postId = request.params.post_id;
    try {
        let post = await Post.findById(postId);
        response.status(200).json({post : post});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Delete a Post
    @path : /api/posts/:post_id
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/:post_id', authenticate, async (request , response) => {
    let postId = request.params.post_id;
    try {
        let post = await Post.findById(postId);
        if(!post){
            return response.status(400).json({errors : [{msg : 'Post not found'}]});
        }
        post = await Post.findByIdAndDelete(postId);
        response.status(200).json({post : post});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Like a Post
    @path : /api/posts/like/:post_id
    @fields : no-fields
    @method : PUT
    @access : PRIVATE
 */
router.put('/like/:post_id', authenticate, async (request , response) => {
    let postId = request.params.post_id;
    try {
        let post = await Post.findById(postId);

        // check if the post has already been like
        if(post.likes.filter(like => like.user.toString() === request.user.id).length > 0){
            return response.status(400).json({errors : [{msg : 'The Post has already been liked'}]});
        }

        post.likes.unshift({user : request.user.id});
        post = await post.save();
        response.status(200).json({post : post});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : un-like a Post
    @path : /api/posts/unlike/:post_id
    @fields : no-fields
    @method : PUT
    @access : PRIVATE
 */
router.put('/unlike/:post_id', authenticate, async (request , response) => {
    let postId = request.params.post_id;
    try {
        let post = await Post.findById(postId);

        // check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === request.user.id).length === 0){
            return response.status(400).json({msg : 'The post has not been liked'});
        }

        let removeIndex = post.likes.map(like => like.user.toString()).indexOf(request.user.id);
        post.likes.splice(removeIndex, 1);
        post = await post.save();
        response.status(200).json({post : post});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Create a Comment to a post
    @path : /api/posts/comment/:post_id
    @fields : text
    @method : POST
    @access : PRIVATE
 */
router.post('/comment/:post_id', authenticate, [
    body('text').notEmpty().withMessage('Text is Required')
], async (request , response) => {
    let postId = request.params.post_id;

    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()});
    }
    try {
        let user = await User.findById(request.user.id);
        let newComment = {
            user : request.user.id,
            text : request.body.text,
            name : user.name,
            avatar : user.avatar
        };
        let post = await Post.findById(postId);
        if(!post){
            return response.status(400).json({errors : [{msg : 'Post not found'}]});
        }
        post.comments.unshift(newComment);
        post = await post.save();
        response.status(200).json({post : post});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Delete a Comment
    @path : /api/posts/comment/:post_id/:comment_id
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/comment/:post_id/:comment_id', authenticate, async (request , response) => {
    let postId = request.params.post_id;
    let commentId = request.params.comment_id;
    try {
        let post = await Post.findById(postId);
        // pull the comments of a post
        let comment = post.comments.find(comment => comment.id === commentId);
        // make sure the comment exists
        if(!comment){
            return response.status(404).json({msg : 'Comment not exists'});
        }
        // check user, is he only made the comment
        if(comment.user.toString() !== request.user.id){
            return response.status(401).json({msg : 'User is not authorized'});
        }

        // get remove index
        let removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(request.user.id);
        post.comments.splice(removeIndex, 1);

        await post.save();
        response.status(200).json({post : post});
    }
    catch (error) {
        console.error(error);
        await response.status(500).json({errors : [{msg : error.message}]});
    }
});

module.exports = router;