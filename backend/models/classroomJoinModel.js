const mongoose = require('mongoose');

const classroomJoinSchema = new mongoose.Schema({
    classroomId :{
        type : mongoose.Schema.Types.ObjectId,//reference to Classroom model 
        ref:'Classroom',//Model name to refer
        required:true,//Ensure it is provided
    },
    studentEmail:{
        type: String,
        required:true,
    },
    code:{
        type:String,
        required:true,
    },
    classOwnerEmail:{
        type:String,
        required:true,
    },
},{timeStamps:true});

const ClassroomJoin = mongoose.model('ClassroomJoin' , classroomJoinSchema);
module.exports = ClassroomJoin;
