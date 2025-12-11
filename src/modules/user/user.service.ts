import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

const createUserIntDB = async( payload : Record<string, unknown>)=>{
    const {name, email, password, phone, role} = payload;

    const hashPassword = await bcrypt.hash(password as string, 12)
    const result = await pool.query(
    `
    INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, hashPassword, phone, role]
    );

    delete result.rows[0].password
    delete result.rows[0].created_at;
    delete result.rows[0].updated_at;
    return result;
}

const getAllUserFromDB = async()=>{

    const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users`,
    );
    
    if (result.rowCount === 0) {
        return [];
    }

    return result.rows;
}

const getUserByIdFromDB = async(id : string)=>{

    const result = await pool.query(
    `SELECT * FROM users WHERE id= $1`, [id]
    );

    if (result.rowCount === 0) {
        return [];
    }

    delete result.rows[0].password;
    delete result.rows[0].created_at;
    delete result.rows[0].updated_at;
    return result.rows;
}

const updateUserByIdFromDB = async(name : string, email : string, phone : string, role : string, id : string)=>{

    const result = await pool.query(
    `UPDATE users SET name=$1, email=$2, phone=$3, role=$4  WHERE id= $5`, [name, email, phone, role,id ]
    );
    
    return result;
}

const deleteUserByIdFromDB = async(id : string)=>{

    const result = await pool.query(
    `DELETE FROM users WHERE id= $1`, [id]
    );
    return result;
}
   
export const userServices ={
    createUserIntDB, getAllUserFromDB, getUserByIdFromDB, updateUserByIdFromDB, deleteUserByIdFromDB
}