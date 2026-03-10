import  express  from "express";
import { LoginSchema, SignupSchema } from "./types";
import mongoose from "mongoose";
import { User } from "./schema";

const app = express()
app.use(express.json())

app.get('/')

app.post('/login',async(req,res)=>{
    const parsedData = LoginSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(403).json({message:'validation failed'})
        return
    }
    try {
        const user = await User.findOne({
            where:{
                email:parsedData.data.email
            }
        })
        if(!user){
            res.status(404).json({
                message:`user does'nt exists`
            })
            return
        }
        if(user.password != parsedData.data.password){
            res.status(404).json({
                message:'invalid username or password'
            })
            return
        }
        
        res.status(200).json({
            email:user.email
        })

        
    } catch (error) {
        res.status(403).json({message:'DB error'})
        return
    }

})

app.post('/signup',async(req,res)=>{
    const parsedData = SignupSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(403).json({message:'validation failed'})
        return
    }
    try {
        const user = await User.create({
            name:parsedData.data.name,
            email:parsedData.data.email,
            password:parsedData.data.password
        })
        res.status(200).json({
            email:user.email
        })
        
    } catch (error) {
        res.status(403).json({message:'DB error'})
        return
    }
})

app.listen('3000',()=> {
    mongoose.connect(process.env.MONGODB_URL ||  '').then(()=>console.log('DB connected'))
    console.log('server running at port 3000')
})