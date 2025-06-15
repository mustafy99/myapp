require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path")
const corsOption = require("./config/corsOptions");
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json());

app.use("/", express.static(path.join(__dirname,"views")))

// Routes
app.use("/" , require("./routes/route"));
app.use("/auth" , require("./routes/authRoutes"));
app.use("/users" , require("./routes/UserRoutes"));
app.use("/order" , require("./routes/orderRoutes"));

// استدعاء ملف البوت
//require('./telegramBot');


app.all("*",(req,res)=>{
  res.status(404)
  if(req.accepts("html")){
         res.sendFile(path.join(__dirname,"views","404.html"))
  }
   else if(req.accepts("json")){
    res.json({messge : " 404 Not Found"})
  }
   else{
    res.type("text").send("404 Not Found")
   }
})
// Database connection events
mongoose.connection.once("open", () => {
  console.log("Server is connected with DB");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});
