import express from "express";
import { AISchema, LoginSchema, SignupSchema } from "./types";
import mongoose from "mongoose";
import { User } from "./schema";
import Groq from "groq-sdk";
const app = express()
const groq = new Groq({apiKey:process.env.GROQ_API_KEY})
app.use(express.json())

//llm call
app.get('/aihint', async (req, res) => {
    // const parsedData = AISchema.safeParse(req.body)
    // if (!parsedData.success) {
    //     res.status(403).json({ message: 'validation failed' })
    //     return
    // }
    res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
    try {
        //Ai call
        const streamData =()=>{ 
            return groq.chat.completions.create({
            messages: [
                // Set an optional system message. This sets the behavior of the
                // assistant and can be used to provide specific instructions for
                // how it should behave throughout the conversation.
                {
                    role: "system",
                    content: "You are a helpful assistant.",
                },
                // Set a user message for the assistant to respond to.
                {
                    role: "user",
                    content: "Explain the importance of fast language models",
                },
            ],
            model: 'openai/gpt-oss-120b',
            temperature:0.5,
            stream:true
        })
    }

        const stream = await streamData()
        for await ( const chunk of stream){
            res.write(chunk)
        }
        res.end()
    } catch (error) {
        res.status(403).json({ message: 'AI error' })
        return
    }
})

app.post('/login', async (req, res) => {
    const parsedData = LoginSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({ message: 'validation failed' })
        return
    }
    try {
        const user = await User.findOne({
            where: {
                email: parsedData.data.email
            }
        })
        if (!user) {
            res.status(404).json({
                message: `user does'nt exists`
            })
            return
        }
        if (user.password != parsedData.data.password) {
            res.status(404).json({
                message: 'invalid username or password'
            })
            return
        }

        res.status(200).json({
            email: user.email
        })


    } catch (error) {
        res.status(403).json({ message: 'DB error' })
        return
    }

})

app.post('/signup', async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({ message: 'validation failed' })
        return
    }
    try {
        const user = await User.create({
            name: parsedData.data.name,
            email: parsedData.data.email,
            password: parsedData.data.password
        })
        res.status(200).json({
            email: user.email
        })

    } catch (error) {
        res.status(403).json({ message: 'DB error' })
        return
    }
})

app.listen('3000', () => {
    mongoose.connect(process.env.MONGODB_URL || '').then(() => console.log('DB connected'))
    console.log('server running at port 3000')
})