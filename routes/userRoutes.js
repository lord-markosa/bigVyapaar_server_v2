import express from "express";
import verifyToken from "../middleware/auth.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import {
    createUser,
    getAllProducts,
    getUserByPhoneNumber,
} from "../models/dao.js";

const router = express.Router();

// User registration
router.post("/register", async (req, res) => {
    const { username, phoneNumber, password } = req.body;

    try {
        // Check if phoneNumber already exists
        const existingUser = await getUserByPhoneNumber(phoneNumber);
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "Phone Number already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await createUser({
            username,
            phoneNumber,
            password: hashedPassword,
            requests: [],
            chats: [],
            tradeRequestSent: [],
        });

        const userId = newUser.id;

        // Generate JWT token
        const token = generateToken(userId);

        // Fetch all products
        const productList = await getAllProducts();

        // Send response with token, success message, requests, and chats
        res.status(201).json({
            token,
            message: "User registered successfully",
            productList,
            id: newUser.id,
            username: newUser.username,
            requests: newUser.requests,
            chats: newUser.chats,
            // generate a pubsub url negotiation
            tradeRequestSent: [],
            negotiation: await negotiate(req, userId),
        });
    } catch (error) {
        console.error(`Error registering user: ${error}`);
        res.status(500).json({ message: "An error occurred" });
    }
});

// User login
router.post("/login", async (req, res) => {
    const { phoneNumber, password } = req.body;
    try {
        const user = await getUserByPhoneNumber(phoneNumber);
        const userId = user.id;

        // get the user by phoneNumber
        if (!user) {
            return res
                .status(404)
                .json({ message: "Phone number not registered!" });
        }

        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(404).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = generateToken(userId);

        // Fetch all products
        const productList = await getAllProducts();

        res.json({
            token,
            message: "Login successful",
            productList,
            id: user.id,
            username: user.username,
            requests: user.requests,
            chats: user.chats,
            tradeRequestSent: user.tradeRequestSent,
            // generate a pubsub url negotiation
            negotiation: await negotiate(req, userId),
        });
    } catch (error) {
        console.error(`Error logging in user: ${error}`);
        res.status(500).json({ message: "An error occurred" });
    }
});

// Fetch user data from token
router.get("/data", verifyToken, async (req, res) => {
    try {
        const productList = await getAllProducts();
        const userId = req.user.id;
        const newToken = generateToken(userId);
        res.json({
            token: newToken,
            productList,
            id: req.user.id,
            username: req.user.username,
            requests: req.user.requests,
            chats: req.user.chats,
            tradeRequestSent: req.user.tradeRequestSent,
            negotiation: await negotiate(req, userId),
        });
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        res.status(500).json({ message: "An error occurred" });
    }
});

// Web PubSub token negotiation
const negotiate = async (req, userId) => {
    const serviceClient = req.app.get("serviceClient");
    try {
        return await serviceClient.getClientAccessToken({
            userId,
        });
    } catch (error) {
        console.error(`Error negotiating token: ${error}`);
        return null;
    }
};

export default router;
