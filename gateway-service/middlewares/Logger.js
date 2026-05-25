import fs from 'fs';
import Service from '../db/models/Service.js';
// import routes from '../routes/routes.json' with { type: 'json' };
const Logger = (req, res, next)=>{
    try{const start= Date.now();
    res.on('finish',async()=>{
        const duration= Date.now() - start;
        // console.log(req)
        const service=await Service.findOne({ service_name: req.params.service_name });
        console.log(service);
        const url= service ? service.url : 'Unknown Service URL';
        console.log(url);    
        const log = `
        [${new Date().toISOString()}]
        ${req.method} ${req.originalUrl} 
        Upstream:${url}${req.originalUrl.replace(`/service/${req.params.service_name}`, '')}
        Status:${res.statusCode} 
        Response Time:${duration}ms 
        Client IP:${req.ip}
        \n`;
        fs.appendFile('./logs/access.log', log, err => {
            if(err) console.error('Failed to write log:', err);
        });
    });
    next();}
    catch(error){
        console.error('Error in Logger middleware:', error);
        next();
    }
}
export default Logger;