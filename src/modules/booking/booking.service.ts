import { pool } from "../../config/db";
import { request } from "express";

const formatDate = (value: any) => {
        if (!value) return value;

        if (typeof value === "string") {

            return value.slice(0, 10);
        }

        if (value instanceof Date) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, "0");
            const day = String(value.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
    };

const createBookingIntDB = async( payload : Record<string, unknown>, car_rent : string)=>{
    const {customer_id, vehicle_id, rent_start_date, rent_end_date} = payload;
    const daily_rent_price = car_rent;

    const rentStartStr = (payload.rent_start_date as string).slice(0, 10);
    const rentEndStr = (payload.rent_end_date as string).slice(0, 10);
    
    const start = new Date(rentStartStr as string);
    const end = new Date(rentEndStr as string);

    const diffInTime = end.getTime() - start.getTime();
    const rentedDays = (diffInTime / (1000 * 60 * 60 * 24));

    const total_price = Number(daily_rent_price) * Number(rentedDays);

    const bookingStatus: string = "active";

    const result = await pool.query(
    `
    INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [customer_id, vehicle_id, rentStartStr, rentEndStr, total_price, bookingStatus]
    );

    const row = result.rows[0];

    row.rent_start_date = formatDate(row.rent_start_date);
    row.rent_end_date = formatDate(row.rent_end_date);

    delete row.created_at;
    delete row.updated_at;

    return row;
}

const getAllBookingFromDB = async (customerId?: number) => {
  const params: any[] = [];
  let query = `
    SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
    FROM bookings
  `;
  
  if (customerId) {

    query += ` WHERE customer_id = $1`;
    params.push(customerId);
  }

  const bookings = await pool.query(query, params);

  const now = new Date();

  for (const booking of bookings.rows) {

    const rentEnd = new Date(booking.rent_end_date);

    if (booking.status === "active" && rentEnd < now) {
  
      await pool.query(
        `UPDATE bookings SET status = $1 WHERE id = $2`,
        ["returned", booking.id]
      );
      booking.status = "returned";

      await pool.query(
        `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
        ["available", booking.vehicle_id]
      );
    }


    const customerRes = await pool.query(
      `SELECT name, email FROM users WHERE id = $1`,
      [booking.customer_id]
    );
    booking.customer = customerRes.rows[0];


    const vehicleRes = await pool.query(
      `SELECT vehicle_name, registration_number, type, availability_status
       FROM vehicles
       WHERE id = $1`,
      [booking.vehicle_id]
    );
    booking.vehicle = vehicleRes.rows[0];
  }


  bookings.rows.forEach((row) => {
    row.rent_start_date = formatDate(row.rent_start_date);
    row.rent_end_date = formatDate(row.rent_end_date);
  });

  return bookings.rows;
};


const getSingleBookingFromDB = async(id : string)=>{

    const result = await pool.query(
    `SELECT * FROM bookings WHERE id= $1`, [id]
    );
    delete result.rows[0].created_at;
    delete result.rows[0].updated_at;
    const rowz = result;

    
    result.rows.forEach((row) => {
    row.rent_start_date = formatDate(row.rent_start_date);
    row.rent_end_date = formatDate(row.rent_end_date);
  });
    return result.rows;
}

const updateBookingByIdFromDB = async(status : string, id : string)=>{

    const result = await pool.query(
    `UPDATE bookings SET status=$1 WHERE id= $2`, [status,id]
    );
    
    return result;
}


export const bookingServices ={
    createBookingIntDB, getAllBookingFromDB, updateBookingByIdFromDB, getSingleBookingFromDB 
}