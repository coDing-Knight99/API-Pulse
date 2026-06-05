import redis from '../db/Redis.js';
import ApiKey from '../db/models/apikey.js';
import crypto from 'crypto';

const apikeyRateLimiter = async(req,res,next)=>{
    try{
        console.log("Checking API key rate limit...\n \n");
        const apiKey = req.headers['x-api-key'];
        if(!apiKey){
            return res.status(401).json({ message: 'API key missing' });
        }
        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
        const key = 'apikey:' + hashedKey;
        const windowSize = 60;
        const metakey = 'apikeymeta:' + hashedKey;
        let ApiKeyMeta = await redis.get(metakey);
        console.log("API key metadata from Redis:", ApiKeyMeta);
        if(!ApiKeyMeta){
            ApiKeyMeta = await ApiKey.findOne({
                apikey: hashedKey,
                isActive: true
            });
            if(ApiKeyMeta){
                console.log("API key metadata found in database:", ApiKeyMeta);
                await redis.set(metakey, JSON.stringify({ tier: ApiKeyMeta.tier }));
                await redis.expire(metakey, 3600);
            }
        }
        else
        {
            ApiKeyMeta = JSON.parse(ApiKeyMeta);
        }
        if(!ApiKeyMeta)
            {
            return res.status(401).json({ message: 'Invalid API key' });
        }
        const max_requests = ApiKeyMeta.tier === 'PREMIUM' ? 1000 : 100;
        let requests = await redis.get(key);
        requests = requests ? parseInt(requests):0;
        if(requests>=max_requests){
            res.rateLimited = true;
            return res.status(429).json({ message: 'Too many requests. Please try again later.' });
        }
        if(requests===0){
            await redis.set(key,1);
            await redis.expire(key,windowSize);
        }
        else{
            await redis.incr(key);
        }
        console.log(`API key ${hashedKey} has made ${requests+1} requests in the current window.`);
        next();
    }catch(err){
        console.error('Error in API key rate limiter:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default apikeyRateLimiter;