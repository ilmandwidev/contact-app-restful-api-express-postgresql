import express from "express";
import cors from "cors";
import { publicRouter } from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";
import { userRouter } from "../route/api.js";

export const web = express();
const corsOptions = {
	origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
	
};
web.use(cors(corsOptions));
web.use(express.json());


// public akan dijalankan dulu dan isinya tidak ada middleware
web.use(publicRouter);
// karena didalam mengunakan authmiddleware
web.use(userRouter);
web.use(errorMiddleware);

