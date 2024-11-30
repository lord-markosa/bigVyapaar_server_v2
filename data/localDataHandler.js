// OLD DEBUG CODE: [TODO] either remove or formalize debugging
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, "localData.json");

const readData = () => {
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// users Handler

export const getUsers = () => readData().users;
export const getUserById = (id) => getUsers().find((user) => user.id === id);

export const saveUser = (user) => {
    const data = readData();
    data.users.push(user);
    writeData(data);
};

export const updateUser = (updatedUser) => {
    const data = readData();
    data.users = data.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
    );
    writeData(data);
};

// chats handler

export const getChats = () => readData().chats;
export const getChatById = (id) => getChats().find((chat) => chat.id == id);

export const addChat = (chat) => {
    const data = readData();
    data.chats.push(chat);
    writeData(data);
};

export const updateChat = (updatedChat) => {
    const data = readData();
    data.chats = data.chats.map((chat) =>
        chat.id === updatedChat.id ? updatedChat : chat
    );
    writeData(data);
};

export const deleteChat = (chatId) => {
    const data = readData();
    data.chats = data.chats.filter((chat) => chat.id !== chatId);
    writeData(data);
};

// product handler

export const getAllProduct = () => {
    const data = readData();
    return data.Product || [];
};

export const addProduct = (product) => {
    const data = readData();
    data.Product = data.Product || [];
    data.Product.push(product);
    writeData(data);
};

export const likeProduct = (productId, username) => {
    const data = readData();
    const product = data.Product.find((s) => s.id === productId);
    if (product && !product.likedBy.includes(username)) {
        product.likes = (product.likes || 0) + 1;
        product.likedBy.push(username);
        writeData(data);
    }
};

export const updateProduct = (productId, updatedContent) => {
    const data = readData();
    const product = data.Product.find((s) => s.id === productId);
    if (product) {
        product.content = updatedContent;
        writeData(data);
    }
};

export const deleteProduct = (productId) => {
    const data = readData();
    data.Product = data.Product.filter((s) => s.id !== productId);
    writeData(data);
};

// events handler

export const getEvents = () => readData().events;
export const getEventById = (id) =>
    getEvents().find((event) => event.id === id);

export const addEvent = (event) => {
    const data = readData();
    data.events.push(event);
    writeData(data);
};

export const updateEvent = (updatedEvent) => {
    const data = readData();
    data.events = data.events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
    );
    writeData(data);
};

export const deleteEvent = (eventId) => {
    const data = readData();
    data.events = data.events.filter((event) => event.id !== eventId);
    writeData(data);
};

// activities handler

export const getActivities = () => readData().activities;
export const getActivityById = (id) =>
    getActivities().find((activity) => activity.id === id);

export const addActivity = (activity) => {
    const data = readData();
    data.activities.push(activity);
    writeData(data);
};

export const updateActivity = (updatedActivity) => {
    const data = readData();
    data.activities = data.activities.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
    );
    writeData(data);
};

export const deleteActivity = (activityId) => {
    const data = readData();
    data.activities = data.activities.filter(
        (activity) => activity.id !== activityId
    );
    writeData(data);
};
