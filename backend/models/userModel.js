
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {required : true, type : String},
    email: {required : true, type : String, unique : true},
    password: {required : true, type : String},
    role : {
        type:String,
        enum : ['professor','student'],
        required:true
    }
},{timeStamps : true});

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

module.exports = mongoose.model('User',userSchema);