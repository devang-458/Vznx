require("dotenv").config();

import express from "express";
import cors from "cors";
import path from "path";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type' ,'Authorization']
}))