import mongoose from "mongoose";
const apiKeySchema = new mongoose.Schema({
    apikey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tier: { type: String, enum: ['Starter', 'Pro', 'Enterprise'], required: true },
    isActive: { type: Boolean, default: true },
    user_id: { type: String, required: true },
    requestsCount: { type: Number, default: 0 },
    createDate: { type: Date, default: Date.now }
},{ timestamps: true });
const ApiKey = mongoose.model('apikey', apiKeySchema);
export default ApiKey;