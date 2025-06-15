const { default: mongoose } = require("mongoose");
const mangoose = require("mongoose");




const connectDB = async ()=>{
    try{
          await mongoose.connect(process.env.DATABASE_URL);
          console.log("✅ connected DON");
    } catch(err){
        console.error("❌ connected LOSS :", err);
    }
}



module.exports = connectDB;
