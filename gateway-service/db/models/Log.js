import mongoose from "mongoose";
const logSchema = new mongoose.Schema({
    request_id: { type: String, required: true },
    user_id: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    serviceName: { type: String, required: true },
    statusCode: { type: Number },
    responseTime: { type: Number },
    apiKeyId: { type: String, required: true },
    apiKeyName: { type: String, required: true },
    tier: { type: String, required: true },
    rateLimited: { type: Boolean }
});
const Log = mongoose.model('Log', logSchema);
export default Log;