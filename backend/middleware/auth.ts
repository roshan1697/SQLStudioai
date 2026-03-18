import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

export const Auth = (req:Request,res:Response,next:NextFunction) =>{
    const token = req.cookies.authToken
    if(!token){
        res.status(404).json({
            message:'token invalid or missing'
        })
        return
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET || '')
        next()
    } catch (error) {
        res.status(500).json({
            message:'internal server occurred'
        })
    }
    
}