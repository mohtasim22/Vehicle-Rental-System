import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import { request } from "express";

const createVehicleIntDB = async( payload : Record<string, unknown>)=>{
    const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = payload;

    const result = await pool.query(
    `
    INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    delete result.rows[0].created_at;
    delete result.rows[0].updated_at;
    return result;
}

const getAllVehicleFromDB = async()=>{

    const result = await pool.query(
    `SELECT id,vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles`,
    );

    return result.rows;
}

const getVehicleByIdFromDB = async(id : string)=>{

    const result = await pool.query(
    `SELECT * FROM vehicles WHERE id= $1`, [id]
    );
    if (result.rowCount === 0) {
        return [];
    }
    delete result.rows[0].created_at;
    delete result.rows[0].updated_at;
    return result.rows;
}

const updateVehicleByIdFromDB = async(vehicle_name : string, type : string,registration_number : string,daily_rent_price : string,availability_status : string, id : string)=>{

    const result = await pool.query(
    `UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id= $6`, [vehicle_name, type, registration_number, daily_rent_price, availability_status,id]
    );
    
    return result;
}

const deleteVehicleByIdFromDB = async(id : string)=>{

    const result = await pool.query(
    `DELETE FROM vehicles WHERE id= $1`, [id]
    );
    return result;
}
   
export const vehicleServices ={
    createVehicleIntDB, getAllVehicleFromDB, getVehicleByIdFromDB, updateVehicleByIdFromDB, deleteVehicleByIdFromDB
}