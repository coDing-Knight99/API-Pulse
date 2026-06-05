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
        const userId = req.user._id;
        const tier = req.body.tier;
        const name = req.body.name;
        console.log("Creating API key for user:", userId, "with tier:", tier);
        console.log("Generated API key:", apiKey);
        console.log("Hashed API key:", hashedKey);
        const newApiKey =await ApiKey.create({ apikey: hashedKey, name: name, tier: tier, user_id: userId });
        console.log("API key created:", newApiKey);
        res.status(200).json({ apiKey });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
};

const revokeApiKey = async (req, res) => {
    try {
        const {keyId} = req.body;

        const apiKeyDoc = await ApiKey.findOne({ _id: keyId, isActive: true });
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

const getApiKeys = async (req, res) => {
    try {
        const userId = req.user._id;
        const apiKeys = (await ApiKey.find({ user_id: userId }));
        apiKeys.sort((a, b) => b.createdAt - a.createdAt);
        res.status(200).json({ apiKeys });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { createApiKey, revokeApiKey, getApiKeys };