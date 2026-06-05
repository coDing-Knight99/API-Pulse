import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const verifyJWT = async (req,res,next)=>{
    

try {
    console.log("Verifying JWT...");
    const token = req.cookies?.accessToken || req.cookies?.AccessToken;
    // console.log("Token from cookie:", token);

    if (!token) {
        console.log(1);
        res.status(401).json({ message: "Access token missing" });
    }

    // console.log("Verifying token...");
    const decodedToken =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
    // console.log("Decoded token:", decodedToken);

    // console.log("Fetching user...");
    const user = await User.findById(decodedToken._id);
    // console.log("User found:", user);

    if (!user) {
        // console.log(2);
        res.status(401).json({ message: "Invalid Access Token" });
    }

    req.user = user;
    next();
} catch (error) {
    // console.log("JWT verification error:", error.name, error.message);
    // console.log(req.cookies);
    // console.log(0);
    res.status(401).json({ message: "Invalid Access Token" });
}

};
export default verifyJWT;