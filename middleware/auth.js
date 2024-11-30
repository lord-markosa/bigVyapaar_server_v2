import jwt from "jsonwebtoken";
import config from "../config.js";
import { getUserById } from "../models/dao.js";

export default async function (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await getUserById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
}
