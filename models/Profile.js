const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user : {type : mongoose.Schema.Types.ObjectId , ref : 'user' , required : true},
    company : {type : String , required : true},
    website : {type : String, required : true},
    location : {type : String, required : true },
    designation : {type : String, required : true },
    skills : [{type : String , required : true}],
    bio : {type : String, required : true },
    githubUsername  : {type : String, required : true},
    experience : [
        {
            title : {type : String , required : true},
            company : {type : String , required : true},
            location : {type : String , required : true},
            from : {type : String , required : true},
            to : {type : String},
            current : {type : Boolean , default : false},
            description : {type : String , required : true},
        }
    ],
    education : [
        {
            school : {type : String , required : true},
            degree : {type : String , required : true},
            fieldOfStudy : {type : String , required : true},
            from : {type : String , required : true},
            to : {type : String},
            current : {type : Boolean , default : false},
            description : {type : String , required : true},
        }
    ],
    social : {
        facebook : {type : String},
        youtube : {type : String},
        twitter : {type : String},
        linkedin : {type : String},
        instagram : {type : String}
    }
}, {timestamps : true});

const Profile = mongoose.model('profile' , ProfileSchema);
module.exports = Profile;