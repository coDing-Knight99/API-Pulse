import Service from '../models/Service.js';
const serviceauth = async(req, res, next) => {
    try{
        console.log("Authenticating service...\n \n");
    const serviceName = req.params.service_name;
    if (!serviceName) {
        return res.status(400).json({error: 'Service name is required in the URL'})
    }
    const service = await Service.findOne({ service_name: serviceName, owner_id: req.user?._id || req.userInfo?.user_id, isActive: true });
    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }
    req.service = service;
    console.log("Service authenticated:", service.service_name, "for user:", req.user?._id || req.userInfo?.user_id);
    next();}
    catch(error){
        return res.status(500).json({ error: error.toString() });
    }  
};
export default serviceauth;