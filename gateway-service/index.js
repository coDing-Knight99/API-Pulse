import express from 'express';
// import routes from './routes/routes.json' with { type: 'json' };
import keyauth from './middlewares/keyauth.js';
import User from './db/models/User.js';
import Logger from './middlewares/Logger.js';
import dotenv from 'dotenv';
import verifyJWT from './db/middlewares/auth.middleware.js';
import serviceauth from './db/middlewares/serviceauth.js';
import { createApiKey, revokeApiKey } from './db/controllers/api.controller.js';
import { registerUser, loginUser, logoutUser } from './db/controllers/user.controller.js';
import  cookieParser from 'cookie-parser';
import {registerService, deleteService} from './db/controllers/microservice.controller.js';
import Service from './db/models/Service.js';  
dotenv.config();
import connectDB from './db/connectdb.js';
connectDB();
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

app.use(cookieParser());

app.use(express.json());
app.post('/register-service', verifyJWT, registerService);
app.post('/delete-service', verifyJWT, deleteService);
app.post('/register', registerUser);
app.post('/login',loginUser);
app.post('/logout', verifyJWT, logoutUser);
app.post('/create-api-key', verifyJWT, createApiKey);   
app.post('/revoke-api-key', verifyJWT, revokeApiKey);

app.use(
    `/service/:service_name`,(req,res,next)=>{console.log("Service route accessed"); next()},keyauth,serviceauth,Logger,
    (req,res,next) => { 
        console.log(req.originalUrl);
        const proxy = createProxyMiddleware({
            target: req.service.url,
            changeOrigin: true,
            ignorePath: false,
            pathRewrite: (path,req )=>{
                 return req.originalUrl.replace(`/service/${req.params.service_name}`, '/');
            },
            on: {
                proxyReq: (proxyReq, req) => {
                    console.log("Proxying request to service:", req.service.service_name, "at URL:", req.service.url);
                    console.log(
                        `[Gateway] ${req.method} ${req.originalUrl}`
                    );
                }
            }
        })
        console.log(proxy);
        return proxy(req, res, next);
    });
    

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});