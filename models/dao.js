import { CosmosClient } from "@azure/cosmos";
import config from "../config.js";

let client;
let database;
let userContainer;
let productContainer;
let requestContainer;

export async function initializeDb() {
    client = new CosmosClient({ endpoint: config.host, key: config.authKey });
    try {
        const dbResponse = await client.databases.createIfNotExists({
            id: config.databaseId,
        });
        database = dbResponse.database;

        const userConRes = await database.containers.createIfNotExists({
            id: config.userContainer,
        });
        userContainer = userConRes.container;

        const productConRes = await database.containers.createIfNotExists({
            id: config.productContainer,
        });
        productContainer = productConRes.container;

        const requestConRes = await database.containers.createIfNotExists({
            id: config.requestContainer,
        });
        requestContainer = requestConRes.container;

        console.log("Initialized database");
    } catch (error) {
        console.error("Error initializing database", error);
    }
}

// Users DAO

// [TODO] Implement the following functions for admins
// export async function getUsers() {
//     const querySpec = {
//         query: "SELECT * FROM c",
//     };
// }

export async function getUserById(userId) {
    const { resource } = await userContainer.item(userId).read();
    return resource;
}

export async function getUserByPhoneNumber(phoneNumber) {
    const { resources } = await userContainer.items
        .query({
            query: `SELECT * FROM c WHERE c.phoneNumber = "${phoneNumber}"`,
        })
        .fetchAll();
    return resources[0];
}

export async function createUser(user) {
    const { resource } = await userContainer.items.create(user);
    return resource;
}

export async function addChatToUser(userId, partner, chatId, isUser1) {
    const { resource: user } = await userContainer.item(userId).read();
    user.chats.push({
        chatId,
        partnerName: partner.username,
        partnerId: partner.id,
        isUser1,
    });
    const { resource } = await userContainer.item(userId).replace(user);
    return resource;
}

// Product DAO

export async function getAllProducts() {
    const { resources } = await productContainer.items.readAll().fetchAll();
    return resources;
}

export async function createProduct(product) {
    const { resource } = await productContainer.items.create(product);
    return resource;
}

export async function getProductById(productId) {
    const { resource } = await productContainer.item(productId).read();
    return resource;
}

export async function updateProduct(product) {
    const { resource } = await productContainer.items.upsert(product);
    return resource;
}

export async function deleteProduct(productId) {
    const { resource } = await productContainer.item(productId).delete();
    return resource;
}

// Chat DAO

export async function createChat(chat) {
    const { resource } = await requestContainer.items.create(chat);
    return resource;
}

export async function getChatById(chatId) {
    const { resource } = await requestContainer.item(chatId).read();
    return resource;
}

export async function insertMessageIntoChat(chatId, message) {
    const { resource } = await requestContainer.item(chatId).read();
    resource.messages.push(message);
    const { resource: updatedResource } = await requestContainer
        .item(chatId)
        .replace(resource);
    return updatedResource;
}

// export async function getUserChats(chats) {
//     const { resources } = await requestContainer.items
//         .query({
//             query: "SELECT * FROM c WHERE c.id IN @chats",
//             parameters: [{ name: "@chats", value: chats }],
//         })
//         .fetchAll();
//     return resources;
// }

// Trade DAO

export async function createTrade(productId, trade, type) {
    const product = await getProductById(productId);
    if (!product) {
        return null;
    }
    product[type + "s"].push(trade);
    const { resource } = await productContainer.items.upsert(product);
    return resource;
}

export async function updateTrade(
    productId,
    tradeId,
    userId,
    tradeDetails,
    type
) {
    const product = await getProductById(productId);
    if (!product) {
        return null;
    }
    const tradeIndex = product[type + "s"].findIndex((t) => t.id === tradeId);
    if (tradeIndex === -1) {
        return null;
    }

    if (product[type + "s"][tradeIndex].userId !== userId) {
        return null;
    }

    product[type + "s"][tradeIndex] = {
        ...product[type + "s"][tradeIndex],
        ...tradeDetails,
    };

    const { resource } = await productContainer.items.upsert(product);
    return resource;
}

export async function deleteTrade(productId, tradeId, userId, type) {
    const product = await getProductById(productId);
    if (!product) {
        return null;
    }

    if (product[type + "s"].find((t) => t.id === tradeId).userId !== userId) {
        return null;
    }

    product[type + "s"] = product[type + "s"].filter((t) => t.id !== tradeId);
    const { resource } = await productContainer.items.upsert(product);
    return resource;
}

// Trade Requests DAO

export async function removeTradeRequestFromUser(userId, tradeId) {
    const user = await getUserById(userId);
    user.requests = user.requests.filter((req) => req.tradeId !== tradeId);
    const { resource } = await userContainer.items.upsert(user);
    return resource;
}

export async function addTradeRequestToUser(userId, tradeRequest) {
    const user = await getUserById(userId);
    user.requests.push(tradeRequest);
    const { resource } = await userContainer.items.upsert(user);
    return resource;
}

export async function addSentTradeRequestToUser(userId, tradeId) {
    const user = await getUserById(userId);
    user.tradeRequestSent.push(tradeId);
    const { resource } = await userContainer.items.upsert(user);
    return resource;
}
