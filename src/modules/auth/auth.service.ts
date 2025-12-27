import bcrypt from "bcryptjs"
import { pool } from "../../config/db"
import jwt from "jsonwebtoken"
import config from "../../config"
 
const loginUserIntoDB = async(email : string, password : string)=>{
    const user = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email])


    if (user.rows.length ===0){
        throw new Error("User not found!");
    }

    const matchPassword = await bcrypt.compare(password, user.rows[0].password);
    

    if(!matchPassword){
        throw new Error("Invalid Credentials!");
    }

       
    const jwtPayload ={
        id : user.rows[0].id,
        name : user.rows[0].name,
        email : user.rows[0].email,
        phone : user.rows[0].phone,
        role : user.rows[0].role
    }

    // const token = jwt.sign(jwtPayload, config.jwtSecret as string, {expiresIn: "7d"})
    const token = jwt.sign(
    {
            ...jwtPayload,
            jti: crypto.randomUUID(), //makes token unique every login
        },
        config.jwtSecret as string,
        {
            expiresIn: "7d",
        }
    );

    delete user.rows[0].password;
    delete user.rows[0].created_at;
    delete user.rows[0].updated_at;
    
    return {token, user : user.rows[0]};
}

export const authServices ={
    loginUserIntoDB
}