import Log from "../models/Log.js";
import crypto from "crypto";
const LogController = async(req,res,next)=>{
    console.log("Logging request...\n \n");
    const request_id = crypto.randomUUID();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const method = req.method;
    const path = req.originalUrl;
    const serviceName = req.params.service_name;
    const apiKeyId = req.apiKey._id;
    const apiKeyName = req.apiKey.name;
    const tier = req.userInfo?.tier;
    const startTime = Date.now();
    res.on("finish",async()=>{
        try{
            const responseTime = Date.now() - req.startTime;
            const statusCode = res.statusCode;

            const logEntry = await Log.create({
                request_id: request_id,
                user_id: req.userInfo.user_id || 'anonymous',
                ip: ip,
                method: method,
                path: path,
                serviceName: serviceName,
                statusCode: statusCode,
                responseTime: responseTime,
                apiKeyId: apiKeyId,
                apiKeyName: apiKeyName,
                tier: tier,    
                rateLimited: req.rateLimited || false
            });
        }
        catch(error){
            console.error("Error in log controller:", error);
        }
    });
    req.startTime=startTime;
    next();
};

const getUserLogs = async (req, res) => {
    try {
        const userId=req.user._id;
        const logs = await Log.find({ user_id: userId }).limit(10).sort({ timestamp: -1 });
        res.status(200).json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user logs', error });
    }
};

const getServiceLogs = async (req,res) =>{
    try{
        console.log('Getting Service Logs')
        const serviceName=req.params.service_name;
        console.log(serviceName)
        const logs=await Log.find({serviceName:serviceName ,user_id:req.user._id}).limit(10).sort({timestamp:-1})
        res.status(200).json({logs});
    }
    catch(error){
        res.status(500).json({message:'Error fetching service logs',error});
    }
}

const getApiKeyLogs = async (req,res) =>{
    try{
        const apiKeyId=req.params.apikeyId;
        const logs=await Log.find({apiKeyId:apiKeyId,user_id:req.user._id}).limit(10).sort({timestamp:-1})
        res.status(200).json({logs});
    }
    catch(error){
        res.status(500).json({message:'Error fetching API key logs',error});
    }   
};
export { LogController, getUserLogs, getServiceLogs, getApiKeyLogs};