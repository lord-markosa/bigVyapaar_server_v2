import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
    addChatToUser,
    addSentTradeRequestToUser,
    addTradeRequestToUser,
    createChat,
    createTrade,
    deleteTrade,
    getProductById,
    removeTradeRequestFromUser,
    updateTrade,
} from "../models/dao.js";

const router = express.Router();

// TRADES: BIDs & ASKs

// Add a new trade
router.post("/:productId/:tradeType", async (req, res) => {
    const { price, quantity, address } = req.body;
    const { productId, tradeType } = req.params;
    const user = req.user;

    // create a new trade object
    const trade = {
        id: uuidv4(),
        price,
        quantity,
        address,
        userId: user.id,
        username: user.username,
        createdAt: new Date(),
    };

    try {
        // add the trade to the product
        const product = await createTrade(productId, trade, tradeType);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
});

router.put("/:productId/:tradeType/:tradeId", async (req, res) => {
    const { price, quantity, address } = req.body;
    const { productId, tradeType, tradeId } = req.params;
    const user = req.user;

    // update the trade object
    const tradeDetails = {
        price,
        quantity,
        address,
    };

    try {
        // update the trade
        const product = await updateTrade(
            productId,
            tradeId,
            user.id,
            tradeDetails,
            tradeType
        );
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
});

// Delete a trade
router.delete("/:productId/:tradeType/:tradeId", async (req, res) => {
    const { productId, tradeType, tradeId } = req.params;
    try {
        // delete the trade
        const product = await deleteTrade(
            productId,
            tradeId,
            req.user.id,
            tradeType
        );
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
});

// REQUESTS

// Create request for a trade
router.post("/request", async (req, res) => {
    const { tradeId, userId, productId } = req.body;

    const receiver = userId;

    try {
        const product = await getProductById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (req.user.tradeRequestSent.find((id) => id === tradeId)) {
            return res
                .status(404)
                .json({ message: "Trade request already sent" });
        }

        const trade = [...product.bids, ...product.asks].find(
            (trade) => trade.id === tradeId
        );

        if (!trade) {
            return res.status(404).json({ message: "Trade not found" });
        }

        // create a trade request object
        const tradeRequest = {
            id: uuidv4(),
            tradeId,
            productId,
            productName: product.productName,
            price: trade.price,
            quantity: trade.quantity,
            address: trade.address,
            userId: req.user.id,
            username: req.user.username,
            createdAt: new Date(),
        };

        // add the trade request to the user
        await addTradeRequestToUser(receiver, tradeRequest);
        await addSentTradeRequestToUser(req.user.id, tradeId);

        res.status(201).json({ tradeId });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
});

// Respond to Trade Request
router.get("/respond/:tradeId/:response", async (req, res) => {
    const { tradeId, response } = req.params;
    const user = req.user;
    try {
        // todo: check if both users are same and chats with same user cannot be created again

        // if the response is accept, we are going to create a chat between the two users
        if (response === "accept") {
            // extract the other userId from the trade request
            const trade = user.requests.find((req) => req.tradeId === tradeId);

            if (!trade) {
                return res
                    .status(404)
                    .json({ message: "Trade request not found" });
            }

            const otherUserId = trade.userId;

            if (otherUserId === user.id) {
                return res
                    .status(404)
                    .json({ message: "Invalid trade request" });
            }

            if (user.chats.find((chat) => chat.partnerId === otherUserId)) {
                return res.status(200).json({ message: "Already created" });
            }

            const user1 = {
                id: user.id,
                username: user.username,
            };

            const user2 = {
                id: otherUserId,
                username: trade.username,
            };

            // create a chat between the two users
            const newChat = await createChat({
                user1,
                user2,
                messages: [],
            });

            // add chat to user's chat list
            await Promise.all([
                addChatToUser(user.id, user2, newChat.id, true),
                addChatToUser(otherUserId, user1, newChat.id, false),
            ]);

            await removeTradeRequestFromUser(user.id, tradeId);
            res.status(201).json({
                chatId: newChat.id,
                partnerId: user2.id,
                partnerName: user2.username,
                isUser1: true,
            });
        } else {
            await removeTradeRequestFromUser(user.id, tradeId);
            res.status(201).json({ message: "Trade request rejected" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
});

// Update a product
// router.put("/:id", async (req, res) => {
//     const { content } = req.body;

//     try {
//         // get the product
//         const product = await getProductById(req.params.id);
//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         // check if the user is the creator of the product
//         if (product.userId !== req.user.id) {
//             return res.status(403).json({ message: "Invalid product access" });
//         }

//         // update the product
//         await updateProduct({ ...product, createdAt: new Date() });

//         res.status(200).json({ message: "Product updated successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating product", error });
//     }
// });

// // Delete a product
// router.delete("/:id", async (req, res) => {
//     const productId = req.params.id;
//     try {
//         // get the product
//         const product = await getProductById(productId);
//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         // check if the user is the creator of the product
//         if (product.createdBy !== req.user.username) {
//             return res.status(403).json({ message: "Invalid product access" });
//         }

//         // delete the product
//         await deleteProduct(productId);
//         res.status(200).json({ message: "Product deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error deleting product", error });
//     }
// });

export default router;
