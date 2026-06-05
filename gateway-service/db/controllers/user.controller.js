import User from '../models/User.js';

const generateAccessAndRefreshTokens = async (user_id)=>{   
    try{
        const user = await User.findById(user_id);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken,refreshToken};}
    catch(error){
        throw new Error('Error generating tokens');
    }
}

const registerUser = async (req, res) => {
    try {
        console.log("Registering user with data:", req.body);
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }     const newUser =await User.create({ name:name, email:email, password:password });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
    console.log("REGISTER ERROR:", error);

    res.status(500).json({
        message: error.message,
        error: error
    });
    }   };
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
        res.status(200).cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        }).json({ message: 'Login successful' });
        req.user = user; // Attach user to request for future use
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
        res.clearCookie("accessToken").clearCookie("refreshToken").json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }  };
export { registerUser, loginUser, logoutUser };