import Service from '../models/Service.js';
const registerService = async (req, res) => {
    try {
        console.log("Registering service for user:", req.user._id);
        const { service_name, url } = req.body;
        const service = await Service.create({ owner_id: req.user._id, service_name, url });
        console.log("Service registered:", service);
        res.status(201).json({ message: 'Service registered successfully', service });
    } catch (error) {
        res.status(500).json({ message: 'Error registering service', error:error });
    }
};
const deleteService = async (req, res) => {
    try {
        const serviceId  = req.body.serviceId;
        console.log("Deleting service with ID:", serviceId, "for user:", req.user._id);
        const service = await Service.findOneAndDelete({ _id: serviceId, owner_id: req.user._id });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error });
    }
};

const editService = async (req, res) => {
    try {
        const { serviceId, service_name, url,isActive } = req.body;
        const service = await Service.findOne(
            { _id: serviceId }
        );
        service.service_name = service_name || service.service_name;
        service.url = url || service.url;
        service.isActive = isActive !== undefined ? isActive : service.isActive;
        await service.save();
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service updated successfully', service });
    } catch (error) {
        res.status(500).json({ message: 'Error editing service', error });
    }
};

const getServices = async (req, res) => {
    try {
        console.log("Fetching services for user:", req.user._id);
        const services = await Service.find({ owner_id: req.user._id });
        res.status(200).json({ services });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error });
    }
};
export { registerService, deleteService, editService, getServices };