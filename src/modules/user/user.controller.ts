import { Request, Response } from "express";
import { userServices } from "./user.service";
import { bookingServices } from "../booking/booking.service";

const createUser = async(req : Request, res : Response)=>{
    try{
        const result = await userServices.createUserIntDB(req.body)
        

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });

    } catch (error : any){
        return res.status(500).json({
            success: true,
            message: error.message,
        });
    }
    
};

const getAllUser = async(req : Request, res : Response)=>{
    try{
        const result = await userServices.getAllUserFromDB()
        
        if (!result || result.length === 0) {
            return res.status(200).json(
                { 
                    success: true,
                    message: "No Users found",
                    data: result, 

                });
        }

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result,
        });

    } catch (error : any){
        return res.status(500).json({
            success: true,
            message: error.message,
        });
    }
    
};

const getSingleUser = async(req : Request, res : Response)=>{
    try{
        const result = await userServices.getUserByIdFromDB(req.params.userId!)
        

        return res.status(201).json({
            success: true,
            message: "User retrieved successfully",
            data: result,
        });

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};


const updateUser = async(req : Request, res : Response)=>{
    const {name, email, phone, role} = req.body;
    try{
        const result1 = await userServices.getUserByIdFromDB(req.params.userId!)
        console.log(result1)

        if (result1.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (req.user!.role==="admin" || (req.user!.role== result1[0].role && req.user!.id== result1[0].id)){
            const result = await userServices.updateUserByIdFromDB(name, email, phone, role, req.params.userId!)
            const result1 = await userServices.getUserByIdFromDB(req.params.userId!)
            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: result1,
            });
        }else{
            return res.status(401).json({
                success: true,
                message: "Unauthorized Action",
            });
        }
        

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const deleteUser = async(req : Request, res : Response)=>{
    try{

        const booking= await bookingServices.getAllBookingFromDB()
        const userId = Number(req.params.userId);
        const exists = booking.some(item => item.customer_id === userId);

        if (exists) {
            return res.status(400).json({
            success: false,
            message: "Can't delete user. User has active bookings.",
            });
        } else {
            const result = await userServices.deleteUserByIdFromDB(req.params.userId!)

            return res.status(200).json({
            success: true,
            message: "User deleted successfully"
            })
        }
        

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
}

export const userController ={
    createUser,getAllUser, updateUser, getSingleUser, deleteUser
}