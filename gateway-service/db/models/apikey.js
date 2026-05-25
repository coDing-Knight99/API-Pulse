import mongoose from "mongoose";
const apiKeySchema = new mongoose.Schema({
    apikey: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['FREE', 'PREMIUM'], required: true },
    isActive: { type: Boolean, default: true },
    user_id: { type: String, required: true }
});
const ApiKey = mongoose.model('apikey', apiKeySchema);
export default ApiKey;