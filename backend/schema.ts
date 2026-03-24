import { password } from "bun";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String
})

const SQLQuestionSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["easy", "medium", "hard"],
            lowercase: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        schema: {
            type: String,
            required: true,
        },
        starterCode: {
            type: String,
            required: true,
        },
        expectedOutput: {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
)

const UserQuestionStateSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
            index: true,
        },

        language: {
            type: String,
            default: "sql",
            enum: ["sql", "javascript", "python", "java", "cpp"],
        },

        code: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["not_started", "in_progress", "solved", "failed"],
            default: "not_started",
        },

        lastRunResult: {
            output: { type: String, default: "" },
            error: { type: String, default: "" },
            passed: { type: Boolean, default: false },
            executionTime: { type: Number, default: 0 }, // ms
            memoryUsed: { type: Number, default: 0 }, // optional
            testCasesPassed: { type: Number, default: 0 },
            totalTestCases: { type: Number, default: 0 },
            ranAt: { type: Date },
        },

        lastSubmittedAt: { type: Date },
        startedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

UserQuestionStateSchema.index({user: 1 , question: 1}, {unique:true})

export const User = mongoose.model('User', UserSchema)
export const SQLQuestion = mongoose.model('SQLQuestion', SQLQuestionSchema)
export const UserQuestionState = mongoose.model('UserQuestionState', UserQuestionStateSchema)