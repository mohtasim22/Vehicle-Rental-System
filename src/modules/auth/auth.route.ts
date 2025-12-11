import { Router } from "express";
import { authController } from "./auth.controller";
import { userController } from "../user/user.controller";

const router = Router()

router.post('/signin', authController.loginUser)
router.post('/signup', userController.createUser)

export const authRoute = router
