import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

const app = express();

dotenv.config({
    path: './.env'
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"));
app.use(cookieParser());

// routes import
import UserRouer from './routes/user.route.js'
import CaptainRouter from './routes/captain.route.js'

// routes declaration
app.use("/api/v1/users", UserRouer);
app.use("/api/v1/captains", CaptainRouter);



export default app
