import mongoose from 'mongoose';
const serviceSchema = new mongoose.Schema({
    owner_id: { type:String, required: true},
    service_name: { type: String, required: true },
    url: { type: String, required: true,
         validate: { 
            validator: v => v.startsWith('http://') || v.startsWith('https://'),
            message: 'Invalid service URL'
     }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
serviceSchema.index({ owner_id: 1, service_name: 1 }, { unique: true });
const Service = mongoose.model('Service', serviceSchema);
export default Service;
