# Welcome to shatbox_server repo

-   use `npm install` to get all the package dependencies
-   use `npm run fast` to start the debug build with the required environment variables in `nodemon.json`

## Endpoints:

-   User Registration: POST /api/users/register
-   User Login: POST /api/users/login
-   Get User's Saved Chats: GET /api/chats (requires authentication)
-   Save a New Chat: POST /api/chats (requires authentication)
