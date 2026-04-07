import express from "express";
import { AISchema, LoginSchema, SignupSchema, userQuestionStateSchema } from "./types";
import mongoose from "mongoose";
import { SQLQuestion, User, UserQuestionState } from "./schema";
import Groq from "groq-sdk";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Auth } from "./middleware/auth";
import cors from 'cors'

const app = express()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const saltRounds = 10
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173'
}))

app.get('/question', async (req, res) => {
    try {
        const question = await SQLQuestion.find({})
        res.status(200).json({
            question: question
        })
    } catch (error) {
        res.status(403).json({ message: 'DB error' })
    }
})

app.get('/dashboard', Auth, async (req, res) => {
    const userId = req.userId
    try {
        const data = await UserQuestionState.aggregate([
            {
            $lookup: {
                from: "userquestionstate",
                let: { questionId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$question", "$$questionId"] },
                                    { $eq: ["$user", new mongoose.Types.ObjectId(userId)] }
                                ]
                            }
                        }
                    }
                ],
                as: "userState"
            }
  },
    {
        $unwind: {
            path: "$userState",
                preserveNullAndEmptyArrays: true
        }
    },
    {
        $project: {
            title: 1,
                difficulty: 1,
                    status: {
                $ifNull: ["$userState.status", "not_started"]
            },
            lastRunPassed: {
                $ifNull: ["$userState.lastRunResult.passed", false]
            }
        }
    }
        ])
        res.status(200).json({
            data:data
        })
    } catch (error) {
    res.status(403).json({ message: 'DB error' })
    return
}
})

//llm call
app.post('/aihint', Auth, async (req, res) => {
    const parsedData = AISchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({ message: 'validation failed' })
        return
    }
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    try {
        //Ai call
        const streamData = () => {
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
                        content: parsedData.data.message,
                    },
                ],
                model: 'openai/gpt-oss-120b',
                temperature: 0.5,
                stream: true
            })
        }

        const stream = await streamData()

        for await (const chunk of stream) {
            res.write(chunk.choices[0]?.delta?.content)
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

            email: parsedData.data.email

        })


        if (!user) {
            res.status(404).json({
                message: `invalid username or password`
            })
            return
        }
        const comparePassword = await bcrypt.compare(parsedData.data.password, user.password as string)
        if (!comparePassword) {
            res.status(404).json({
                message: 'invalid username or password'
            })
            return
        }

        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || '', {
            expiresIn: '24h'
        })

        res.status(200).json({
            id: user._id.toString(),
            email: user.email,
            token: token
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

        const hashedPassword = await bcrypt.hash(parsedData.data.password, saltRounds)

        const user = await User.create({
            name: parsedData.data.name,
            email: parsedData.data.email,
            password: hashedPassword
        })

        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || '',
            {
                expiresIn: '24h'
            })

        res.status(200).json({
            userId: user._id.toString(),
            email: user.email,
            token: token
        })

    } catch (error: unknown) {
        const e = error as { code?: 11000 }
        if (e?.code === 11000) {
            res.status(400).json({
                message: 'Email already exists'
            })
            return
        }
        res.status(500).json({ message: 'DB error' })
        return
    }
})

app.listen('3000', () => {
    mongoose.connect(process.env.MONGODB_URL || '').then(() => console.log('DB connected'))
    console.log('server running at port 3000')
})



