const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    
    full_name:{
        type:String,
        required: true
    }, 
    email:{
        type:String,
        required: true,
        unique:true
    },

    password:{
        type:String,
        required: true,
    },

    nationalID:{
        type:String,
        required: true,
        unique:true
    },

    phone:{
        type:String,
        required: false,
        unique:false
    },
    age: {
        type: Number,
        min: 0,
        max: 120
      },

    role:{
        type:String,
        required: false,
        enum:['patient','nurse','SuberVisor','admin'],
        default:'patient'
    },
    telegramId: {
        type: String,
        required: false,
        unique: true // ممكن تشيله لو هتسمح بأكثر من حساب بنفس ID
      },
      
 

},{timestamps:true});


module.exports = mongoose.model("userModel",UserSchema);