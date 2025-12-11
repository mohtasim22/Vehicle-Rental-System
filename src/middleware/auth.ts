import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { pool } from "../config/db";
import config from "../config";

const auth=(...roles: string[])=>{

    return async (req: Request, res: Response, next: NextFunction)=>{

        try {
            const authHeader  =req.headers.authorization;
            console.log(authHeader)
            if (!authHeader) {
                return res.status(401).json({ message: "No authorization header provided" });
            }
            const [scheme, token] = authHeader.split(" ");

            if (scheme !== "Bearer" || !token) {
                return res.status(401).json({ message: "Token not provided" });
            }

            if (!token|| token==undefined ) {
                return res.status(401).json({ message: "You are not authorized!" });
            }
            const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload
            req.user = decoded;
            console.log(req.user)
            //["admin"]
            if (roles.length && !roles.includes(decoded.role as string)) {
                return res.status(401).json({
                error: "You are not authorized!",
                });
            }

            next();
            } catch (err: any) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Token expired" });
                }

                if (err.name === "JsonWebTokenError") {
                    return res.status(401).json({ message: "Invalid token: " + err.message });
                }
                return res.status(500).json({
                    success: false,
                    message: err.message,
                });
        }
    }
}

export default auth;