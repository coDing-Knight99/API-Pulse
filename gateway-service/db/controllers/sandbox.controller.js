import axios from 'axios';
import RequestHistory from '../models/RequestHistory.js';
const sendRequest = async(req, res) =>{
    try{
        console.log("Received request in sandbox controller:", req.body);
        const { method, url, body, headers, queryParams } = req.body;
        if(url.startsWith('http://') || url.startsWith('https://')){
            const alreadySaved = await RequestHistory.findOne({
                userId: req.user.id,
                method,
                url
            });
            if(alreadySaved){
                alreadySaved.updatedAt = new Date();
                alreadySaved.requestCount += 1;
            }
            const startTime = Date.now();
            const response = await axios({
                method,
                url,
                body,
                headers
            });
            const latency = Date.now() - startTime;;
            if(!alreadySaved){
            const requestHistory = new RequestHistory({
                userId: req.user.id,
                method,
                url,
                body,
                headers,
                queryParams,
                status: response.status
            });
            await requestHistory.save();
        }
        console.log("Response from sandbox request:", response.data);
            return res.status(response.status).send({data:response.data,latency:latency});
        }
        else
        {
            return res.status(400).json({ error: 'Invalid URL' });
        }
    }
    catch(error){
    if(error.response){
        return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
        error: error.message
    });
}
    finally{
        console.log(res);
    }
}

const getRecentRequests = async (req,res ) =>{
    try{
        let recentRequests = await RequestHistory.find({ userId: req.user.id }).sort({ createdAt: -1 });
        if(recentRequests.length > 50){
            RequestHistory.deleteMany({ _id: { $in: recentRequests.slice(50).map(req => req._id) } });
        }
        recentRequests = recentRequests.slice(0, 50);
        return res.status(200).json(recentRequests);
    }
    catch(error){
        console.log("Error fetching recent requests:", error);
        return res.status(500).json({ error: error.toString() });
    }
}

export { sendRequest, getRecentRequests };