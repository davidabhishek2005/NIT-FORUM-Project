const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim:true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    description:{
        type: String,
        trim : true,
    },
    students:[String],
    posts : [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Post',
    }]

},{timeStamps : true});


const Classroom = mongoose.model('Classroom',classroomSchema);

module.exports = Classroom;