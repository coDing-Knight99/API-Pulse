import redis from "./db/Redis.js"
import Log from "./db/models/Log.js";
const BatchSize = 100;
const Flush_Interval=10000; // 10 seconds
const workernode = async()=>{
    try{
        const qlen=await redis.llen("queue:logs");
        if(qlen===0) return;
        const len=Math.min(qlen,BatchSize);
        const pipeline = redis.pipeline();
        for(let i=0;i<len;i++){
            pipeline.rpop("queue:logs");
        }
        const results=await pipeline.exec();
        const logs = results
        .map(([err, res]) => res)
        .filter(Boolean)
        .map(logStr => JSON.parse(logStr));
        if(logs.length > 0){
            await Log.insertMany(logs,{ordered:false});
            console.log("Worker flushed logs !!!!!!!!");
        }
    }catch(error){
        console.error("Worker Error failed to flush logs",error)
    }
}

const startWorker = ()=>{
    setInterval(async()=>{
        await workernode();
    },Flush_Interval);
}

export default startWorker;