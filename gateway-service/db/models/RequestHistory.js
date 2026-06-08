import mongoose from 'mongoose';
const requestHistorySchema = new mongoose.Schema({
    userId:{type:String, required:true},
    method:{type:String, required:true},
    url:{type:String, required:true},
    headers:{type:Object},
    body:{type:Object},
    queryParams:{type:Object},
    requestCount:{type:Number, default:1},
    createdAt:{type:Date, default:Date.now}
},{timestamps:true});

const RequestHistory = mongoose.model('RequestHistory',requestHistorySchema);
export default RequestHistory;