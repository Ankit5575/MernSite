const express = require("express")
const router = express.Router()
const Subscriber = require("../models/Subscriber")

//route post /api/subscribe 
//desc handle newletter subcriotion 
//access Public 

router.post("/subscribe" , async(req , res)=>{
    const {email} = req.body;
    if(!email){
        return res.status(400).json({message:"Email is required "})
    }
    try {
        //check if the email is already subscibe 
        let subscriber = await Subscriber.findOne({email})
        if(subscriber){
            return res.status(400).json({message:"email is alreay subcribed"})
        }
//create a new subsciber 
subscriber = new Subscriber({email})
await subscriber.save()

res.status(201).json({message:"Successfully subscribed to the newsletter ! "})



        
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Server Error"})
    }
})

module.exports = router ;