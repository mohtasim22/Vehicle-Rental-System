import express, { Request, Response} from "express"
import { userRoute } from "./modules/user/user.route";
import { initDB } from "./config/db";
import { authRoute } from "./modules/auth/auth.route";
import { vehicleRoute } from "./modules/vehicle/vehicle.route";
import { bookingRoute } from "./modules/booking/booking.route";
import config from "./config";


const app = express();
const port= config.port;
app.use(express.json());



initDB ()

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Vehicle Rental System server!");
});
app.use('/api/v1/users', userRoute)
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/vehicle', vehicleRoute)
app.use('/api/v1/bookings', bookingRoute)

app.get('/', (req : Request, res : Response)=>{
    res.status(200).json({
        message : "This is the root route",
        path : req.path
    })
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})