import express from 'express';
// import routes from './routes/routes.json' with { type: 'json' };
import keyauth from './middlewares/keyauth.js';
import {sendRequest,getRecentRequests}from './db/controllers/sandbox.controller.js';
import User from './db/models/User.js';
import Logger from './middlewares/Logger.js';
import dotenv from 'dotenv';
import verifyJWT from './db/middlewares/auth.middleware.js';
import serviceauth from './db/middlewares/serviceauth.js';
import { createApiKey, revokeApiKey, getApiKeys } from './db/controllers/api.controller.js';
import { registerUser, loginUser, logoutUser, loginStatus } from './db/controllers/user.controller.js';
import  cookieParser from 'cookie-parser';
import {registerService, deleteService, getServices, editService} from './db/controllers/microservice.controller.js';
import Service from './db/models/Service.js';  
import ipRateLimiter from './middlewares/ipRateLimiter.js';
import apikeyRateLimiter from './middlewares/apikeyRateLimiter.js';
import {LogController, getUserLogs,getServiceLogs, getApiKeyLogs} from './db/controllers/log.controller.js';
import aggregation from './db/middlewares/aggregation.js';
import { getKeyDailyRequests, getKeyHourlyRequests } from './db/controllers/analytics.controller.js';
import {getserviceMetrics, getapikeyMetrics, getglobalMetrics, getuserMetrics, getHourlyRequests, getserviceHourlyRequests, getserviceDailyRequests } from './db/controllers/analytics.controller.js';

dotenv.config();
import connectDB from './db/connectdb.js';
connectDB();
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3000;
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());

app.use(express.json());
app.post('/register-service', verifyJWT, registerService);
app.post('/edit-service', verifyJWT, editService);
app.post('/delete-service', verifyJWT, deleteService);
app.post('/register', registerUser);
app.post('/login',loginUser);
app.post('/logout', verifyJWT, logoutUser);
app.get('/loginstatus', loginStatus);
app.post('/create-api-key', verifyJWT, createApiKey);   
app.post('/revoke-api-key', verifyJWT, revokeApiKey);
app.get('/api-keys', verifyJWT, getApiKeys);    
app.get('/metrics/service/:service_name', verifyJWT, serviceauth, getserviceMetrics);
app.get('/metrics/apikey/:apikeyId', verifyJWT, getapikeyMetrics);
app.get('/metrics/global', getglobalMetrics);
app.get('/metrics/user', verifyJWT, getuserMetrics);
app.get('/metrics/userhourlyrequests', verifyJWT, getHourlyRequests);
app.get('/services', verifyJWT, getServices);
app.get('/userLogs', verifyJWT, getUserLogs);
app.get('/metrics/servicehourlyrequests/:service_name',verifyJWT,serviceauth,getserviceHourlyRequests);
app.get('/serviceLogs/:service_name',verifyJWT,serviceauth,getServiceLogs);
app.get('/apikeyLogs/:apikeyId',verifyJWT,getApiKeyLogs);
app.get('/metrics/servicedailymetrics/:service_name',verifyJWT,serviceauth,getserviceDailyRequests);
app.get('/metrics/apikeydailymetrics/:apikeyId',verifyJWT,getKeyDailyRequests);
app.get('/metrics/apikeyhourlymetrics/:apikeyId',verifyJWT,getKeyHourlyRequests);
app.post('/sandbox',(req,res,next)=>{console.log("Sandbox request received");
    next();
}, verifyJWT, sendRequest);
app.get('/sandbox/recent-requests', verifyJWT, getRecentRequests);
app.use(
    `/service/:service_name`,(req,res,next)=>{console.log("Service route accessed"); next()},aggregation,keyauth,serviceauth,ipRateLimiter,apikeyRateLimiter,LogController,
    Logger,
    (req,res,next) => { 
        console.log(req.originalUrl);
        const proxy = createProxyMiddleware({
            target: req.service.url,
            changeOrigin: true,
            ignorePath: false,
            pathRewrite: (path,req )=>{
                 return req.originalUrl.replace(`/service/${req.params.service_name}`, '');
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
    
app.get('/', (req, res) => {
    res.send('Welcome to the API Gateway!');
}   );
app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});