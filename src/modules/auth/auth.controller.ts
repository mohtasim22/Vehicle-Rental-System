import { Request, Response } from "express";
import { authServices } from "./auth.service";

const loginUser = async(req : Request, res : Response)=>{
    try{
        
        const result = await authServices.loginUserIntoDB(req.body.email, req.body.password)

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });

    } catch (error : any){
        return res.status(500).json({
            success: true,
            message: error.message,
        });
    }
    
};

export const authController ={
    loginUser,
}