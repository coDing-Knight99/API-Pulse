import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
},{ timestamps: true });


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)    
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,                                                               
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: String(process.env.ACCESS_TOKEN_EXPIRY) 
    }
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,  
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: String(process.env.REFRESH_TOKEN_EXPIRY)
    }
)
}

const User = mongoose.model('User', userSchema);
export default User;  