const config = {};

config.host = process.env.HOST;
config.authKey = process.env.AUTH_KEY;
config.databaseId = "BigVyapaar";
config.userContainer = "Users";
config.productContainer = "Products";
config.requestContainer = "Requests";

config.nodeEnv = process.env.NODE_ENV || "development";
config.jwtSecret = process.env.JWT_SECRET || "thereIsNoSecret";
config.port = process.env.PORT || "3001";
config.azurePsConnStr = process.env.AZURE_PS_CONN_STR;
config.azurePsHub = process.env.AZURE_PS_HUB;
config.adminKey = process.env.ADMIN_KEY;

export default config;
