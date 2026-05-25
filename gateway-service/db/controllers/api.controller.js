import crypto from 'crypto';
import ApiKey from '../models/apikey.js';
const createApiKey = async (req, res) => {
    try {
        let apiKey;
        let hashedKey;
        let existingKey;
        do{
            apiKey = crypto.randomBytes(32).toString('hex');
            hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
            existingKey = await ApiKey.findOne({ apikey: hashedKey });
        }while(existingKey);
        const userId = req.userId;
        const tier = req.body.tier;
        console.log("Creating API key for user:", userId, "with tier:", tier);
        console.log("Generated API key:", apiKey);
        console.log("Hashed API key:", hashedKey);
        const newApiKey =await ApiKey.create({ apikey: hashedKey, tier: tier, user_id: userId });
        console.log("API key created:", newApiKey);
        res.status(200).json({ apiKey });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
};

const revokeApiKey = async (req, res) => {
    try {
        const {apikey} = req.body;
        const hashedKey = crypto.createHash('sha256').update(apikey).digest('hex');
        const apiKeyDoc = await ApiKey.findOne({ apikey: hashedKey });
        if (apiKeyDoc) {
            apiKeyDoc.isActive = false;
            await apiKeyDoc.save();
        }
        else
        {
            return res.status(404).json({ message: "API key not found" });
        }
        res.status(200).json({ message: "API key revoked successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export { createApiKey, revokeApiKey };