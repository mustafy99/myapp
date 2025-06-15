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
      },    role:{
        type:String,
        required: false,
        enum:['patient','nurse','SuberVisor','admin'],
        default:'patient'
    },

    telegramId: {
    type: String,
    sparse: true,
    default: null,  // هذا يسمح بوجود قيم null متعددة
  }
      
 

},{timestamps:true});


module.exports = mongoose.model("userModel",UserSchema);