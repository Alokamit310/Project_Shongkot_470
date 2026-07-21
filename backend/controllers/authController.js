const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/jwt");

// ==========================
// Register User
// ==========================
const register = async (req, res) => {
    try {

        const { fullName, email, password, phone, role, district } = req.body;
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const normalizedRole = role || "citizen";

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            role: normalizedRole,
            district,
        });

        const token = generateToken(user._id, user.role);

        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            district: user.district,
        };

        res.status(201).json({
            success: true,
            message: "Registration Successful",
            token,
            user: userResponse,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==========================
// Login User
// ==========================
const login = async (req, res) => {

    try {

        const { email, password } = req.body;
        const normalizedEmail = String(email || "").trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password",
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password",
            });
        }

        const token = generateToken(user._id, user.role);

        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            district: user.district,
        };

        res.status(200).json({
            success: true,
            token,
            user: userResponse,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

module.exports = {
    register,
    login,
};