const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
    username:String,
    email:String,
    password:String,
    verified:{type:Boolean, default:false}
})

const UserModel=mongoose.model("user",userSchema)

module.exports={
    UserModel
}