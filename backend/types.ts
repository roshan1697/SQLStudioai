import { password } from "bun";
import z, { email } from "zod";

export const LoginSchema = z.object({
    email:z.string().trim().toLowerCase().pipe(z.email()),
    password:z.string().min(6)
})

export const SignupSchema = z.object({
    name:z.string(),
    email:z.string().trim().toLowerCase().pipe(z.email()),
    password:z.string().min(6)
})

export const AISchema = z.object({
    userId:z.string(),
    message:z.string()
})