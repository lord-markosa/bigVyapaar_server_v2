// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import verifyToken from "./middleware/auth.js";
import path from "path";
import { WebPubSubServiceClient } from "@azure/web-pubsub";
import { fileURLToPath } from "url";
import config from "./config.js";
import { initializeDb } from "./models/dao.js";

const PORT = config.port;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const serviceClient = new WebPubSubServiceClient(
    config.azurePsConnStr,
    config.azurePsHub
);

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

app.set("serviceClient", serviceClient);

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", verifyToken, chatRoutes);
app.use("/api/product", verifyToken, productRoutes);
app.use("/api/trade", verifyToken, tradeRoutes);
app.use("/test/", testRoutes);

app.listen(PORT, () => {
    initializeDb();
    console.log(`Server running on port ${PORT}`);
});
