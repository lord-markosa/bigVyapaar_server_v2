import express from "express";
import config from "../config.js";

const router = express.Router();

router.get("/create-tables", async (req, res) => {
    const { admin_key } = req.body;
    if (admin_key !== process.env.ADMIN_KEY) {
        return res
            .status(403)
            .json({ message: "You are not allowed to perform this operation" });
    }

    // main logic here

    res.json({ message: "Operation not enabled" });
});

router.get("/drop-tables", async (req, res) => {
    const { admin_key } = req.body;
    if (admin_key !== config.adminKey) {
        return res
            .status(403)
            .json({ message: "You are not allowed to perform this operation" });
    }

    // main logic here

    res.json({ message: "Operation not enabled" });
});

export default router;
