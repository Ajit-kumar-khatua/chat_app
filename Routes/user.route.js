const express=require("express")
const { UserModel } = require("../Models/user.model")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const nodemailer=require("nodemailer")



const userRouter=express.Router()

userRouter.get("/",(req,res)=>{
    res.send("All Good")
})

userRouter.post("/register",async (req,res)=>{
    let {username,email,password}=req.body
    try {
        let user=await UserModel.find({email})
        if(user.length==0){
            bcrypt.hash(password,5,async (err,hash_password)=>{
                if(err){
                    console.log(err)
                }else{
                    let user=new UserModel({username,email,password:hash_password})
                    await user.save()
                }
                let registerUser=await UserModel.find({email})

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'ajitkhatua286@gmail.com',
                        pass: process.env.emailPassword
                    }
                });
                const mailOptions = {
                    from: 'ajitkhatua286@gmail.com',
                    to: `${email}`,
                    subject: 'Verify your Email',
                    text: `Please click on the link for Veify your email. http://localhost:8080/user/${registerUser[0]._id}`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ message: 'Error while sending conformation mail' });
                    } else {
                        // res.json({ msg: "new booking created successfully" })
                        return res.status(200).json({ message: 'Confiramtion sent to email', msg: "User registered successfully" });
                    }
                });
            })

        }else{
            res.send({"msg":"Email id already registered."})
        }
        
    } catch (error) {
        console.log(error)
        res.send("Error While registeration")
    }
})

userRouter.get("/:id",async (req,res)=>{
    let id=req.params.id
    try {
        let payload={verified:true}
        let user=await UserModel.findByIdAndUpdate({_id:id},payload)
        res.send("Email Id verified")        
    } catch (error) {
        console.log(error)
    }
})

userRouter.post("/login",async (req,res)=>{
    let {email,password}=req.body
    try {
        let user=await UserModel.find({email})
        if(user.length!=0){
            let hash_password=user[0].password
            if(user[0].verified==true){
                bcrypt.compare(password,hash_password,(err,result)=>{
                    if(result){
                        var token= jwt.sign({userID:user[0]._id},process.env.key)
                        res.status(201).send({"msg":"Login Successful",name:user[0].username,token})
                   }else{
                      console.log(err)
                      res.send({"msg":"Wrong Credentials"})
                   }
                })

            }else{
                res.send({"msg":"You are not verified."})
            }

        }else{
            res.send({"msg":"Wrong Credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.send("error While logging in.")
    }
})

module.exports={
    userRouter
}