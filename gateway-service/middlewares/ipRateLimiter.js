import redis from '../db/Redis.js';
const ipRateLimiter = async(req,res,next)    => { 
    try{
        console.log("Applying IP rate limiter...\n \n");
        req.startTime = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const key = `ip:${ip}`;
    const windowSize = 60; // 1 minute
    const maxRequests = 20; // Max 20 requests per window
    let requests=await redis.get(key);
    requests=requests?parseInt(requests):0;
    if(requests>=maxRequests)   {
        req.rateLimited = true;
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    if(requests===0)   {
        await redis.set(key,1,);
        await redis.expire(key,windowSize);
    }
    else
    {
        await redis.incr(key);
    }
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - requests - 1);
    next();
}   catch(err)    {
    console.error('Error in IP rate limiter:', err);
    return res.status(500).json({ message: 'Internal server error' });
}};

export default ipRateLimiter;