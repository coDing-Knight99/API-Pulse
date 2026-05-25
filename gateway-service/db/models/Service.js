import mongoose from 'mongoose';
const serviceSchema = new mongoose.Schema({
    owner_id: { type:String, required: true},
    service_name: { type: String, required: true },
    url: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
const Service = mongoose.model('Service', serviceSchema);
export default Service;
