import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct,
} from "../models/dao.js";

const router = express.Router();

// Get all product (this should not be explicitly required for now)
router.get("/", async (_, res) => {
    try {
        res.status(200).json(await getAllProducts());
    } catch (error) {
        res.status(500).json({ message: "Error fetching Product", error });
    }
});

// Add a new product
router.post("/", async (req, res) => {
    const { productName, category, description } = req.body;
    const user = req.user;
    try {
        res.status(201).json(
            await createProduct({
                productName,
                category,
                description,
                bids: [],
                asks: [],
                createdAt: new Date(),
                createdBy: user.id,
            })
        );
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
});

// Update a product
router.put("/:id", async (req, res) => {
    const { content } = req.body;

    try {
        // get the product
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // check if the user is the creator of the product
        if (product.userId !== req.user.id) {
            return res.status(403).json({ message: "Invalid product access" });
        }

        // update the product
        await updateProduct({ ...product, createdAt: new Date() });

        res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
});

// Delete a product
router.delete("/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        // get the product
        const product = await getProductById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // check if the user is the creator of the product
        if (product.createdBy !== req.user.username) {
            return res.status(403).json({ message: "Invalid product access" });
        }

        // delete the product
        await deleteProduct(productId);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
});

export default router;
