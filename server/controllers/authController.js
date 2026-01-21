import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// ---------------- REGISTER ----------------
export const registerUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Both Fields are required" });

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(409).json({ message: "Username already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();


        res.json({ success: true, username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- LOGIN ----------------
export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Both Fields are required" });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password); // must match the field
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ success: true, username: user.username, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
