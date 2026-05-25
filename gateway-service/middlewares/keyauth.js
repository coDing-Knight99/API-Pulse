import mongoose from "mongoose";
import apikey from "../db/models/apikey.js";
import crypto from "crypto";
const keyauth= async (req,res,next)=>{
    try{
        console.log("Authenticating API key...");
    const apiKey = req.headers['x-api-key'];
    console.log("API key from header:", apiKey);
    if (!apiKey){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const key=await apikey.findOne({ apikey: hashedKey, isActive: true });
    if (!key){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.apiKey = key;
    req.user={ user_id: key.user_id , tier: key.tier };
    console.log("API key authenticated for user:", req.user.user_id, "with tier:", req.user.tier);
    next();
}catch(error){
    res.status(500).json({ error: error.toString() });
}
};
export default keyauth;