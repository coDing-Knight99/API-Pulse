import Service from '../models/Service.js';
const registerService = async (req, res) => {
    try {
        const { service_name, url } = req.body;
        const service = await Service.create({ owner_id: req.userId, service_name, url });
        res.status(201).json({ message: 'Service registered successfully', service });
    } catch (error) {
        res.status(500).json({ message: 'Error registering service', error:error });
    }
};
const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.body.serviceId;
        const service = await Service.findOneAndDelete({ _id: serviceId, owner_id: req.user._id });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error });
    }
};
export { registerService, deleteService };