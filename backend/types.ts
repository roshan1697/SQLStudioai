import z, { email } from "zod";


const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const languageEnum = z.enum(["sql", "javascript", "python", "java", "cpp"])
const statusEnum = z.enum([
    "not_started",
    "in_progress",
    "solved",
    "failed",
])
const lastRunResultSchema = z.object({
    output: z.string().default(""),
    error: z.string().default(""),
    passed: z.boolean().default(false),
    executionTime: z.number().default(0),
    memoryUsed: z.number().default(0),
    testCasesPassed: z.number().default(0),
    totalTestCases: z.number().default(0),
    ranAt: z.coerce.date().optional(),
})



export const LoginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(6)
})

export const SignupSchema = z.object({
    name: z.string(),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(6)
})

export const AISchema = z.object({
    userId: z.string(),
    message: z.string()
})

export const userQuestionStateSchema = z.object({
    user: objectId,
    question: objectId,

    language: languageEnum.default("sql"),

    code: z.string().default(""),

    status: statusEnum.default("not_started"),

    lastRunResult: lastRunResultSchema.default({
        output: "",
        error: "",
        passed: false,
        executionTime: 0,
        memoryUsed: 0,
        testCasesPassed: 0,
        totalTestCases: 0,
    }),

    lastSubmittedAt: z.coerce.date().optional(),

    startedAt: z.coerce.date().default(() => new Date()),
})

declare global {

    namespace Express {
        interface Request {
            userId: string;
        }
    }
}