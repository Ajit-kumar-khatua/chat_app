const express=require("express")
const { connection } = require("./config/db")
const { userRouter } = require("./Routes/user.route")
require("dotenv").config()
const cors=require("cors")
const socketio=require("socket.io")
const http=require("http")



const app=express()
const server=http.createServer(app)
const io=socketio(server)

app.use(express.json())
app.use(cors())

app.use("/user",userRouter)

app.get("/",(req,res)=>{
    res.send("Home Page")
})

let users=[]

function userJoin(id,room){
    const user={id,room}
    users.push(user)
    console.log(users)
    return user
}

function getCurrentUser(id){
    return users.find(user=> user.room)
}

function userLeave(id){
    const index=users.findIndex(user=>user.id==id)
    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

io.on("connection",(socket)=>{
    console.log("Client is Connected")
    socket.on("joinRoom",({room})=>{
        const user= userJoin(socket.id,room)
        socket.join(user.room)
    })

    socket.on("chatmessage",(msg)=>{
        const user=getCurrentUser(socket.id)

        io.to(user.room).emit("message",msg)
    })
    
    socket.on("disconnect",()=>{
        const user= userLeave(socket.id)
        console.log("Client Disconnected.")
    })
})



server.listen(process.env.port,async ()=>{
    try {
        await connection
        console.log("connected To DB")
    } catch (error) {
        console.log(error)
    }
    console.log(`Server is running on port ${process.env.port}`)
})