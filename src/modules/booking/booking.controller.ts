import { Request, Response } from "express";
import { bookingServices } from "./booking.service";
import { vehicleServices } from "../vehicle/vehicle.service";

const createBooking = async(req : Request, res : Response)=>{

    try{
        const {vehicle_id} = req.body;
        const vehicle = await vehicleServices.getVehicleByIdFromDB(vehicle_id)
        const availability_status = vehicle[0].availability_status
        
        if(availability_status == 'available'){
            const result = await bookingServices.createBookingIntDB(req.body, vehicle[0].daily_rent_price)
            const result2= await vehicleServices.updateVehicleByIdFromDB(vehicle[0].vehicle_name, vehicle[0].type, vehicle[0].registration_number, vehicle[0].daily_rent_price, "booked",vehicle[0].id)


            return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {...result,"vehicle":{"vehicle_name": vehicle[0].vehicle_name, "daily_rent_price": vehicle[0].daily_rent_price} },
        })

        }else{
            return res.status(201).json({
                success: false,
                message: "Vehicle is Booked"
            });
        }
        
    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const getAllBooking = async(req : Request, res : Response)=>{
    try {
    const user = req.user as { id: number; role: string };

    const isAdmin = user.role === "admin";

    // Admin: all bookings; Customer: only their own bookings
    const bookings = await bookingServices.getAllBookingFromDB(
      isAdmin ? undefined : user.id
    );

    // For customers, hide customer_id & customer object
    if (!isAdmin) {
      bookings.forEach((b: any) => {
        delete b.customer;
      });
      bookings.forEach((b: any) => {
        delete b.vehicle.availability_status;
      });

    }
    if (isAdmin) {
      bookings.forEach((b: any) => {
        delete b.vehicle.type;
        delete b.vehicle.availability_status;
      });
    }  

    return res.status(200).json({
      success: true,
      message: isAdmin
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully",
      data: bookings,
    });

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const getSingleBooking = async(req : Request, res : Response)=>{
    try{
        const result = await bookingServices.getSingleBookingFromDB(req.params.bookingId!)
        

        return res.status(201).json({
            success: true,
            message: "Booking retrieved successfully",
            data: result,
        });

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};

const updateBooking = async(req : Request, res : Response)=>{
    
    try{
        const {status} = req.body;
        const resultb = await bookingServices.getSingleBookingFromDB(req.params.bookingId!)

        if (req.user!.role=="customer" && req.user!.id==resultb[0].customer_id){
            if (status==="cancelled"){
                const now = new Date();
                const rentStart = new Date(resultb[0].rent_start_date);
                if (rentStart < now) {
                    return res.status(400).json({
                    success: false,
                    message: "Can't cancel booking after start date",
                });
                }else{
                    const result = await bookingServices.updateBookingByIdFromDB(status, req.params.bookingId!)
                    const resultx = await bookingServices.getSingleBookingFromDB(req.params.bookingId!)
                    const resulty = await vehicleServices.getVehicleByIdFromDB(resultx[0].vehicle_id)
                    const resultz= await vehicleServices.updateVehicleByIdFromDB(
                        resulty[0].vehicle_name,
                        resulty[0].type,
                        resulty[0].registration_number,
                        resulty[0].daily_rent_price,
                        "available",
                        resulty[0].id
                    )

                    return res.status(200).json({
                    success: true,
                    message: "Booking cancelled successfully",
                    data: resultx,
                    });

                }
                
            }else{
                return res.status(404).json({
                success: false,
                message: "Customer only can Cancel booking"
            })
            }
        }else{
            if (status==="returned"){
                const result = await bookingServices.updateBookingByIdFromDB(status, req.params.bookingId!)
                const resultx = await bookingServices.getSingleBookingFromDB(req.params.bookingId!)
                const resulty = await vehicleServices.getVehicleByIdFromDB(resultx[0].vehicle_id)
                const resultz= await vehicleServices.updateVehicleByIdFromDB(
                    resulty[0].vehicle_name,
                    resulty[0].type,
                    resulty[0].registration_number,
                    resulty[0].daily_rent_price,
                    "available",
                    resulty[0].id
                )
                const resulta = await vehicleServices.getVehicleByIdFromDB(resultx[0].vehicle_id)

                return res.status(200).json({
                success: true,
                message: "Booking marked as returned. Vehicle is now available",
                data: {...resultx[0],"vehicle":{"availability_status": resulta[0].availability_status}},
                });
            }else{
                return res.status(404).json({
                success: false,
                message: req.user!.role=="customer"? "You can't change other customer's booking status." : "Admin only can mark a booking Return."
            })
            }
        }

    } catch (error : any){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
};


export const bookingController ={
    createBooking, getAllBooking, updateBooking, getSingleBooking
}