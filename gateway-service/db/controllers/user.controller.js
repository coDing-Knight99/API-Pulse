import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const generateAccessAndRefreshTokens = async (user_id) => {
    try {
        const user = await User.findById(user_id);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new Error('Error generating tokens');
    }
}

const registerUser = async (req, res) => {
    try {
        console.log("Registering user with data:", req.body);
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        const newUser = await User.create({ username: username, email: email, password: hashedPassword });
        console.log("User registered successfully:", newUser.email);
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log("REGISTER ERROR:", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
const loginUser = async (req, res) => {
    try {
        console.log("Login attempt with data:", req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if (!user || !(await user.isPasswordCorrect(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        console.log("Login Successful for user:", user.email);
        return res.status(200).cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000 // 900000 ms
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 10 * 24 * 60 * 60 * 1000 // refresh token
        }).json({ message: 'Login successful' });
    } catch (error) {
        return res.status(500).json({ message:"Internal Server Error" });
    }
};
const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
        return res.clearCookie("accessToken",{httpOnly: true,
            secure: true,
            sameSite: "none",}).clearCookie("refreshToken",{httpOnly: true,
                secure: true,
                sameSite: "none",}).status(200).json({ message: 'Logout successful' });
    } catch (error) {
        return res.status(500).json({ message:"Internal Server Error" });
    }
};

const loginStatus = async (req,res) =>{
    const accessToken = req.cookies.accessToken
    if(!accessToken)
    {
        return res.status(401).json({isLogin:false})
    }
    try{
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({isLogin:true})
    }catch(error){
        return res.status(401).json({isLogin:false})
    }
}

const refreshTokens = async (req, res) => {
    const accessToken = req.cookies.accessToken;
    let decodedAccessToken;
    if (accessToken) {
        try {
            decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            return res.status(200).json({ isLogin: true, accessTokenPersisted: true })
        }
        catch (error) {
            if (error.name !== "TokenExpiredError") {
                return res.status(401).json({
                    isLogin: false,
                    invalidAccessToken: true
                });
            }
            const refreshToken = req.cookies.refreshToken;
            let decodedRefreshToken;
            if (refreshToken) {
                try {
                    decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
                }
                catch (err) {
                    return res.status(401).json({ isLogin: false, accessTokenExpired: true })
                }
            }
            else
                return res.status(401).json({ isLogin: false, refreshTokenMissing: true });
            const user = await User.findOne({ _id: decodedRefreshToken._id });
            if (!user) {
                return res.status(401).json({ isLogin: false, userBlackListed: true });
            }
            if (user.refreshToken != refreshToken) {
                return res.status(403).json({ isLogin: false, forbidden: true })
            }
            const newAccessToken = await user.generateAccessToken();
            const newRefreshToken = await user.generateRefreshToken();
            user.refreshToken = newRefreshToken
            await user.save({ validateBeforeSave: false });
            return res.status(200).cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 10 * 24 * 60 * 60 * 1000 // refresh token
            }).cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 15 * 60 * 1000 // access token
            }).json({
                isLogin: true,
                refreshedUsingRefreshToken: true
            });
        }
    } else {
        return res.status(401).json({ isLogin: false, accessTokenMissing: true })
    }
}
export { registerUser, loginUser, logoutUser, loginStatus, refreshTokens };