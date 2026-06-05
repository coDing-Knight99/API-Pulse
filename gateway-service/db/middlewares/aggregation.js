import redis from '../Redis.js';
import serviceauth from './serviceauth.js';

const aggregation = (req, res, next) => {

    res.on("finish", async () => {
        try {
            console.log("Aggregating metrics...\n\n");
            const serviceId = req.service?._id;
            const apikey = req.apiKey?.apikey;
            const now = new Date();
            const date = now.toISOString().split('T')[0];
            const hour = String(now.getUTCHours()).padStart(2, '0');
            const userGlobal = `metrics:user:${req.userInfo?.user_id}`;
            const serviceGlobal = `metrics:service:${serviceId}`;
            const apikeyGlobal = `metrics:apikey:${apikey}`;
            const userKeyHourly = `metrics:user:${req.userInfo?.user_id}:${date}:${hour}`;
            const userKeyDaily = `metrics:user:${req.userInfo?.user_id}:${date}`;
            const ServiceKeyHourly = `metrics:service:${serviceId}:${date}:${hour}`;
            const ServiceKeyDaily = `metrics:service:${serviceId}:${date}`;
            const apikeyKeyHourly = `metrics:apikey:${apikey}:${date}:${hour}`;
            const apikeyKeyDaily = `metrics:apikey:${apikey}:${date}`;
            const globalKeyHourly = `metrics:global:${date}:${hour}`;
            const globalKeyDaily = `metrics:global:${date}`;
            console.log(`${req.startTime}\n\n`);
            const latency = req.startTime ? Date.now() - req.startTime : 0;
            console.log(`Request to service ${serviceId} with API key ${apikey} took ${latency} ms and returned status ${res.statusCode}`);
            const pipeline = redis.pipeline();
            if(serviceId)
                {
                    pipeline.hincrby(ServiceKeyHourly, `statusCode:${res.statusCode}`, 1);
                    pipeline.hincrby(ServiceKeyDaily, `statusCode:${res.statusCode}`, 1);
                    pipeline.hincrby(ServiceKeyDaily, "requests", 1);
                    pipeline.hincrby(ServiceKeyHourly, "requests", 1);
                    pipeline.hincrby(ServiceKeyHourly, "latencyCount", 1);
                    pipeline.hincrby(ServiceKeyDaily, "latencyCount", 1);
                    pipeline.hincrby(ServiceKeyHourly, "latency", latency);
                    pipeline.hincrby(ServiceKeyDaily, "latency", latency);
                    pipeline.hincrby(serviceGlobal, "requests", 1);
                    pipeline.hincrby(serviceGlobal, `statusCode:${res.statusCode}`, 1);
                    pipeline.hincrby(serviceGlobal, "latency", latency);
                    pipeline.hincrby(serviceGlobal, "latencyCount", 1);
                    if(res.statusCode>=400){
                        pipeline.hincrby(ServiceKeyHourly, "errors", 1);
                        pipeline.hincrby(ServiceKeyDaily, "errors", 1);
                        pipeline.hincrby(serviceGlobal, "errors", 1);
                    }
                    if(res.statusCode==429){
                        pipeline.hincrby(ServiceKeyHourly, "rateLimited", 1);
                        pipeline.hincrby(ServiceKeyDaily, "rateLimited", 1);
                        pipeline.hincrby(serviceGlobal, "rateLimited", 1);
                    }
                    pipeline.expire(ServiceKeyHourly, 60 * 60 * 24);
                    pipeline.expire(ServiceKeyDaily, 60 * 60 * 24 * 7);
                    pipeline.expire(serviceGlobal, 60 * 60 * 24 * 7);
                }
                if(apikey)
                    {
                        pipeline.hincrby(apikeyKeyHourly, `statusCode:${res.statusCode}`, 1);
                        pipeline.hincrby(apikeyKeyHourly, "requests", 1);
                        pipeline.hincrby(apikeyKeyDaily, `statusCode:${res.statusCode}`, 1);
                        pipeline.hincrby(apikeyKeyDaily, "requests", 1);
                        pipeline.hincrby(apikeyKeyDaily, "latency", latency);
                        pipeline.hincrby(apikeyKeyHourly, "latencyCount", 1);
                        pipeline.hincrby(apikeyKeyDaily, "latencyCount", 1);
                        pipeline.hincrby(apikeyKeyHourly, "latency", latency);
                        pipeline.hincrby(apikeyKeyDaily, "latency", latency);
                            pipeline.hincrby(apikeyGlobal, "requests", 1);
                            pipeline.hincrby(apikeyGlobal, `statusCode:${res.statusCode}`, 1);
                            pipeline.hincrby(apikeyGlobal, "latency", latency);
                            pipeline.hincrby(apikeyGlobal, "latencyCount", 1);
                        if(res.statusCode>=400){
                            pipeline.hincrby(apikeyKeyHourly, "errors", 1);
                            pipeline.hincrby(apikeyKeyDaily, "errors", 1);
                            pipeline.hincrby(apikeyGlobal, "errors", 1);
                        }
                        if(res.statusCode==429){
                            pipeline.hincrby(apikeyKeyHourly, "rateLimited", 1);
                            pipeline.hincrby(apikeyKeyDaily, "rateLimited", 1);
                            pipeline.hincrby(apikeyGlobal, "rateLimited", 1);
                        }
                        pipeline.expire(apikeyKeyHourly, 60 * 60 * 24);
                        pipeline.expire(apikeyKeyDaily, 60 * 60 * 24 * 7);
                        pipeline.expire(apikeyGlobal, 60 * 60 * 24 * 7);
                    }
            pipeline.hincrby(userKeyHourly, `statusCode:${res.statusCode}`, 1);
            pipeline.hincrby(globalKeyHourly, `statusCode:${res.statusCode}`, 1);
            pipeline.hincrby(globalKeyHourly, "requests", 1);
            pipeline.hincrby(globalKeyDaily, `statusCode:${res.statusCode}`, 1);
            pipeline.hincrby(globalKeyDaily, "requests", 1);
            pipeline.hincrby(userKeyHourly, "requests", 1);
            pipeline.hincrby(userKeyDaily, `statusCode:${res.statusCode}`, 1);
            pipeline.hincrby(userKeyDaily, "requests", 1);
            pipeline.hincrby(userGlobal, "requests", 1);
            pipeline.hincrby(userGlobal, `statusCode:${res.statusCode}`, 1);
            pipeline.hincrby(userGlobal, "latency", latency);
            pipeline.hincrby(userGlobal, "latencyCount", 1);
            if (res.statusCode >= 400) {
                pipeline.hincrby(userKeyHourly, "errors", 1);
                pipeline.hincrby(globalKeyHourly, "errors", 1);
                pipeline.hincrby(userKeyDaily, "errors", 1);
                pipeline.hincrby(globalKeyDaily, "errors", 1);
                pipeline.hincrby(userGlobal, "errors", 1);
            }
            if(res.statusCode === 429){
                pipeline.hincrby(userKeyHourly, "rateLimited", 1);
                pipeline.hincrby(globalKeyHourly, "rateLimited", 1);
                pipeline.hincrby(userKeyDaily, "rateLimited", 1);
                pipeline.hincrby(globalKeyDaily, "rateLimited", 1);
                console.log(`User ${req.userInfo?.user_id} was rate limited.`);
                pipeline.hincrby(userGlobal, "rateLimited", 1);
            }
            pipeline.hincrby(userKeyHourly, "latencyCount", 1);
            pipeline.hincrby(globalKeyHourly, "latencyCount", 1);
            pipeline.hincrby(userKeyDaily, "latencyCount", 1);
            pipeline.hincrby(globalKeyDaily, "latencyCount", 1);
            pipeline.hincrby(userKeyHourly, "latency", latency);
            pipeline.hincrby(globalKeyHourly, "latency", latency);
            pipeline.hincrby(userKeyDaily, "latency", latency);
            pipeline.hincrby(globalKeyDaily, "latency", latency);

            pipeline.expire(userKeyHourly, 60 * 60 * 24);
            pipeline.expire(globalKeyHourly, 60 * 60 * 24);
            pipeline.expire(userKeyDaily, 60 * 60 * 24 * 7);
            pipeline.expire(globalKeyDaily, 60 * 60 * 24 * 7);
            pipeline.expire(userGlobal, 60 * 60 * 24 * 7);
            await pipeline.exec();
        }
        catch (error) {
            console.error("Error in aggregation middleware:", error);
        }
    });
    next();
};
export default aggregation;