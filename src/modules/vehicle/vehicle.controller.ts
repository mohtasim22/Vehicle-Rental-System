import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

const createVehicle = async(req : Request, res : Response)=>{
    try{
        const result = await vehicleServices.createVehicleIntDB(req.body)
        

        return res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: result.rows[0],
        });

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const getAllVehicle = async(req : Request, res : Response)=>{
    try{
        const result = await vehicleServices.getAllVehicleFromDB()
        
        if (!result || result.length === 0) {
            return res.status(200).json(
                { 
                    success: true,
                    message: "No vehicles found",
                    data: result, 

                });
        }

        return res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: result,
        });

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const getSingleVehicle = async(req : Request, res : Response)=>{
    try{
        const result = await vehicleServices.getVehicleByIdFromDB(req.params.vehicleId!)
        
        if (!result || result.length === 0) {
            return res.status(200).json(
                { 
                    success: true,
                    message: "No vehicles found",
                    data: result, 

                });
        }
        return res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully",
            data: result,
        });

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const updateVehicle = async(req : Request, res : Response)=>{
    const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = req.body;
    try{
        const result = await vehicleServices.updateVehicleByIdFromDB(vehicle_name, type, registration_number, daily_rent_price, availability_status, req.params.vehicleId!)
        

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        } else {
            const resultx = await vehicleServices.getVehicleByIdFromDB(req.params.vehicleId!)
            res.status(200).json({
                success: true,
                message: "Vehicle updated successfully",
                data: resultx[0],
            });
        }

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const deleteVehicle = async(req : Request, res : Response)=>{
    try{
        const result1 = await vehicleServices.getVehicleByIdFromDB(req.params.vehicleId!)

        if (!result1 || result1.length === 0) {
            return res.status(200).json(
                { 
                    success: true,
                    message: "No vehicles found",
                    data: result1, 

                });
        }

        if(result1[0].availability_status == "available"){
            const result = await vehicleServices.deleteVehicleByIdFromDB(req.params.vehicleId!)
        
            
            return res.status(200).json({
                success: true,
                message: "Vehicle deleted successfully"
            });
            
        }else{
            return res.status(400).json({
                success: false,
                message: "Vehicle is currently booked, can't be deleted."
            });
        }

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};


export const vehicleController ={
    createVehicle, getAllVehicle, getSingleVehicle, updateVehicle, deleteVehicle
}