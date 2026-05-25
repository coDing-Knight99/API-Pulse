import Service from '../models/Service.js';
const serviceauth = async(req, res, next) => {
    try{
    const serviceName = req.params.service_name;
    if (!serviceName) {
        return res.status(400).json({error: 'Service name is required in the URL'})
    }
    const service = await Service.findOne({ service_name: serviceName });
    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }
    const keyOwnerId = req.user.user_id.toString();
    const serviceOwnerId = service.owner_id.toString();
    if(keyOwnerId !== serviceOwnerId){
        return res.status(403).json({ error: 'Forbidden: You do not have access to this service' });
    }
    req.service = service;
    console.log("Service authenticated:", service.service_name, "for user:", req.user.user_id);
    next();}
    catch(error){
        res.status(500).json({ error: error.toString() });
    }  
};
export default serviceauth;