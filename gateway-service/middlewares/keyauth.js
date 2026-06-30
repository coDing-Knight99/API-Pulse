import mongoose from "mongoose";
import ApiKey from "../db/models/apikey.js";
import crypto from "crypto";
const keyauth= async (req,res,next)=>{
    try{
        console.log("Authenticating API key...\n \n");
    const apiKey = req.headers['x-api-key'];
    console.log("API key from header:", apiKey);
    if (!apiKey){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const key=await ApiKey.findOne({ apikey: hashedKey, isActive: true });
    if (!key){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.apiKey = key;
    key.requestsCount = (key.requestsCount || 0) + 1;
    await key.save();
}catch(error){
    return res.status(500).json({ error: error.toString() });
}
finally{
    req.userInfo={ user_id: req.apiKey.user_id , tier: req.apiKey.tier, hashedKey: req.apiKey.apikey };
    console.log("API key authenticated for user:", req.userInfo.user_id, "with tier:", req.userInfo.tier);
    next();
}
};
export default keyauth;