import redis from '../Redis.js';
const userKeyHourly = (userId, date, hour) => `metrics:user:${userId}:${date}:${hour}`;
const ServiceKeyHourly = (serviceId, date, hour) => `metrics:service:${serviceId}:${date}:${hour}`;
const apikeyKeyHourly = (apikey, date, hour) => `metrics:apikey:${apikey}:${date}:${hour}`;
const globalKeyHourly = (date, hour) => `metrics:global:${date}:${hour}`;
const userKeyDaily = (userId, date) => `metrics:user:${userId}:${date}`;
const ServiceKeyDaily = (serviceId, date) => `metrics:service:${serviceId}:${date}`;
const apikeyKeyDaily = (apikey, date) => `metrics:apikey:${apikey}:${date}`;
const globalKeyDaily = (date) => `metrics:global:${date}`;
const getserviceMetrics = async (req, res) => {
    try {
        console.log("Getting service metrics...");
        const serviceId=req.service?._id;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const hour = String(now.getUTCHours()).padStart(2, '0');
        const serviceMetricsHourly = await redis.hgetall(ServiceKeyHourly(serviceId, date, hour));
        const serviceMetricsDaily = await redis.hgetall(ServiceKeyDaily(serviceId, date));
        const serviceGlobal = await redis.hgetall(`metrics:service:${serviceId}`);
        Object.keys(serviceMetricsHourly).forEach(key => {
            serviceMetricsHourly[key] = parseInt(serviceMetricsHourly[key], 10);
        });
        Object.keys(serviceMetricsDaily).forEach(key => {
            serviceMetricsDaily[key] = parseInt(serviceMetricsDaily[key], 10);
        });
        Object.keys(serviceGlobal).forEach(key => {
            serviceGlobal[key] = parseInt(serviceGlobal[key], 10);
        });
        serviceMetricsHourly.avglatency = serviceMetricsHourly.latencyCount > 0 ? (serviceMetricsHourly.latency || 0) / serviceMetricsHourly.latencyCount : 0;
        serviceMetricsDaily.avglatency = serviceMetricsDaily.latencyCount > 0 ? (serviceMetricsDaily.latency || 0) / serviceMetricsDaily.latencyCount : 0;
        serviceGlobal.avglatency = serviceGlobal.latencyCount > 0 ? (serviceGlobal.latency || 0) / serviceGlobal.latencyCount : 0;
        res.status(200).json({ serviceMetricsHourly, serviceMetricsDaily, serviceGlobal });
    } catch (error) {
        console.error("Error in getserviceMetrics:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getapikeyMetrics = async (req, res) => {
    try {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const hour = String(now.getUTCHours()).padStart(2, '0');
        const apikey=req.params.apikeyId;
        const apikeyMetricsHourly = await redis.hgetall(apikeyKeyHourly(apikey, date, hour));
        const apikeyMetricsDaily = await redis.hgetall(apikeyKeyDaily(apikey, date));
        const apikeyGlobal = await redis.hgetall(`metrics:apikey:${apikey}`);
        Object.keys(apikeyMetricsHourly).forEach(key => {
            apikeyMetricsHourly[key] = parseInt(apikeyMetricsHourly[key], 10);
        });
        Object.keys(apikeyMetricsDaily).forEach(key => {
            apikeyMetricsDaily[key] = parseInt(apikeyMetricsDaily[key], 10);
        });
        Object.keys(apikeyGlobal).forEach(key => {
            apikeyGlobal[key] = parseInt(apikeyGlobal[key], 10);
        });
        apikeyMetricsHourly.avglatency = apikeyMetricsHourly.latencyCount > 0 ? (apikeyMetricsHourly.latency || 0) / apikeyMetricsHourly.latencyCount : 0;
        apikeyMetricsDaily.avglatency = apikeyMetricsDaily.latencyCount > 0 ? (apikeyMetricsDaily.latency || 0) / apikeyMetricsDaily.latencyCount : 0;
        apikeyGlobal.avglatency = apikeyGlobal.latencyCount > 0 ? (apikeyGlobal.latency || 0) / apikeyGlobal.latencyCount : 0;
        res.status(200).json({ apikeyMetricsHourly, apikeyMetricsDaily, apikeyGlobal });
    } catch (error) {
        console.error("Error in getapikeyMetrics:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getglobalMetrics = async (req, res) => {
    try {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const hour = String(now.getUTCHours()).padStart(2, '0');
        const globalMetricsHourly = await redis.hgetall(globalKeyHourly(date, hour));
        Object.keys(globalMetricsHourly).forEach(key => {
            globalMetricsHourly[key] = parseInt(globalMetricsHourly[key], 10);
        });
        globalMetricsHourly.avglatency = globalMetricsHourly.latencyCount > 0 ? (globalMetricsHourly.latency || 0) / globalMetricsHourly.latencyCount : 0;
        const globalMetricsDaily = await redis.hgetall(globalKeyDaily(date));
        Object.keys(globalMetricsDaily).forEach(key => {
            globalMetricsDaily[key] = parseInt(globalMetricsDaily[key], 10);
        });
        globalMetricsDaily.avglatency = globalMetricsDaily.latencyCount > 0 ? (globalMetricsDaily.latency || 0) / globalMetricsDaily.latencyCount : 0;
        res.status(200).json({ globalMetricsHourly, globalMetricsDaily });
    } catch (error) {
        console.error("Error in getglobalMetrics:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getuserMetrics = async (req, res) => {
    try {
        console.log("Getting user metrics...");
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const hour = String(now.getUTCHours()).padStart(2, '0');
        const userId = req.user._id;
        console.log(`Fetching metrics for user ${userId} on ${date} at hour ${hour}`);
        const userMetricsHourly = await redis.hgetall(userKeyHourly(userId, date, hour));
        const userMetricsDaily = await redis.hgetall(userKeyDaily(userId, date));
        const userGlobal = await redis.hgetall(`metrics:user:${userId}`);
        Object.keys(userMetricsHourly).forEach(key => {
            userMetricsHourly[key] = parseInt(userMetricsHourly[key], 10);
        });
        Object.keys(userMetricsDaily).forEach(key => {
            userMetricsDaily[key] = parseInt(userMetricsDaily[key], 10);
        });
        Object.keys(userGlobal).forEach(key => {
            userGlobal[key] = parseInt(userGlobal[key], 10);
        });
        userMetricsHourly.avglatency = userMetricsHourly.latencyCount > 0 ? (userMetricsHourly.latency || 0) / userMetricsHourly.latencyCount : 0;
        userMetricsDaily.avglatency = userMetricsDaily.latencyCount > 0 ? (userMetricsDaily.latency || 0) / userMetricsDaily.latencyCount : 0;
        userGlobal.avglatency = userGlobal.latencyCount > 0 ? (userGlobal.latency || 0) / userGlobal.latencyCount : 0;

        res.status(200).json({ userMetricsHourly, userMetricsDaily, userGlobal });
    } catch (error) {
        console.error("Error in getuserMetrics:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getHourlyRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const now = new Date();
        const date = now.toISOString().split("T")[0];

        const hourlyData = [];

        for(let hour = 0; hour < 24; hour++) {
            const hr = String(hour).padStart(2, "0");

            const key = `metrics:user:${userId}:${date}:${hr}`;

            const metrics = await redis.hgetall(key);

            hourlyData.push({
                hour: hr,
                requests: Number(metrics.requests || 0)
            });
        }

        return res.status(200).json(hourlyData);

    } catch(error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

const getserviceHourlyRequests = async (req, res) => {
    try {
        console.log("Hourly requests");
        console.log(req.service);
        const serviceId = req.service._id;

        const now = new Date();
        const date = now.toISOString().split("T")[0];

        const hourlyData = [];
        const hourlyLatency = [];
        const hourlyErrors = [];
        for(let hour = 0; hour < 24; hour++) {
            const hr = String(hour).padStart(2, "0");

            const key = ServiceKeyHourly(serviceId,date,hr);

            const metrics = await redis.hgetall(key);

            hourlyData.push({
                hour: hr,
                requests: Number(metrics.requests || 0)
            });
            hourlyLatency.push({
                hour: hr,
                latency: Number((metrics.latency/metrics.latencyCount).toFixed(2) || 0)
            });
            hourlyErrors.push({
                hour: hr,
                errors: Number(metrics.errors || 0)
            });
        }

        return res.status(200).json({hourlyData,hourlyErrors,hourlyLatency});

    } catch(error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

const getserviceDailyRequests = async ( req,res )=>{
    const now= new Date();
    try{
        console.log("Daily requests");
        const serviceId = req.service._id;
        const dailyRequests = [];
        const dailyLatency = [];
        const dailyErrors = [];
        for(let day = 6; day >= 0; day--) {
            const dt = new Date(now);
            dt.setDate(now.getDate() - day);
            const d = dt.toISOString().split("T")[0];
            const key = ServiceKeyDaily(serviceId,d);
            const metrics = await redis.hgetall(key);
            console.log(metrics);
            dailyRequests.push({
                day: d,
                requests: Number(metrics.requests || 0)
            });
            dailyLatency.push({
                day: d,
                latency: Number((metrics.latency/metrics.latencyCount).toFixed(2) || 0)
            });
            dailyErrors.push({
                day: d,
                errors: Number(metrics.errors || 0)
            });
        }
        return res.status(200).json({dailyRequests,dailyLatency,dailyErrors});
    }
    catch(error){
        return res.status(500).json({
            error: error.message
        });
    }
}

const getKeyHourlyRequests = async (req, res) => {
    try {
        const apikey = req.params.apikeyId;
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const hourlyRequests = [];
        const hourlyLatency = [];
        const hourlyErrors=[];
        for(let hour = 0; hour < 24; hour++) {
            const hr = String(hour).padStart(2, "0");
            const key = apikeyKeyHourly(apikey, date, hr);
            const metrics = await redis.hgetall(key);
            hourlyRequests.push({
                hour: hr,
                requests: Number(metrics.requests || 0)
            });
            hourlyLatency.push({
                hour: hr,
                latency: Number(metrics.latency?(metrics.latency/metrics.latencyCount).toFixed(2):0)
            });
            hourlyErrors.push({
                hour: hr,
                errors: Number(metrics.errors || 0)
            });
        }
        return res.status(200).json({hourlyRequests, hourlyLatency, hourlyErrors});
    } catch(error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

const getKeyDailyRequests = async (req, res) => {
    try {
        const apikey = req.params.apikeyId;
        const now = new Date();
        const dailyRequests = [];
        const dailyLatency = [];
        const dailyErrors=[];
        for(let day = 6; day >= 0; day--) {
            const dt = new Date(now);
            dt.setDate(now.getDate() - day);
            const d = dt.toISOString().split("T")[0];
            const key = apikeyKeyDaily(apikey, d);
            const metrics = await redis.hgetall(key);
            dailyRequests.push({
                day: d,
                requests: Number(metrics.requests || 0)
            });
            dailyLatency.push({
                day: d,
                latency: Number((metrics.latency/metrics.latencyCount).toFixed(2) || 0)
            });
            dailyErrors.push({
                day: d,
                errors: Number(metrics.errors || 0)
            });
        }
        return res.status(200).json({dailyRequests, dailyLatency, dailyErrors});
    } catch(error) {
        return res.status(500).json({
            error: error.message
        });
    }
}

export { getserviceMetrics, getapikeyMetrics, getglobalMetrics, getuserMetrics, getHourlyRequests, getserviceHourlyRequests, getserviceDailyRequests, getKeyHourlyRequests, getKeyDailyRequests };