  const allowedorigin = require("./allowedOrigin")


 const corsoption = {
    origin: (origin,callback)=>{

        if(allowedorigin.indexOf(origin==-1 || !origin)){

               callback(null,true)
        }else{
            callback(new Error("errore in cors"))
            console.log("Not allowed by cors")
        }

    },
    Credentials:true,
    optionsSucessStatus: 200
}

module.exports = corsoption;