import jwt from "jsonwebtoken";
import config from "../config.js";

// Generate JWT
export default function (id) {
    return jwt.sign({ id }, config.jwtSecret);
}
