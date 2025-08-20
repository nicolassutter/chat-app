# Chat App

[See it live](https://chat-app.hostpanda.dev)

## Stack

- I chose Nuxt over Vue on its own so I would have a backend for DB access, auth and web sockets
- Nuxt UI + Tailwind for easy UI components and great default styling
- Web sockets for real-time chat (handled by Nuxt and Nitro)
- Better Auth for auth via Drizzle and SQLite (@libsql/client)
- tRPC for type-safe API calls between the frontend and backend

## Features

- User registration and login
- Real-time chat with web sockets
- Create rooms
- Join rooms
- Leave rooms
- Send messages in rooms
- View messages in rooms (last 10 messages)
- View users in rooms
- Admin users in a room can kick other users (the admin is the user who created the room)
- Auth Guard for routes

## Run it locally

I chose Bun as the runtime and package manager, so Bun needs to be installed.

1. Clone the repo
2. Install dependencies with `bun install`
3. Start the dev server with `bun run dev`
   - A dev.db file will be created in the root of the project
4. Visit `http://localhost:3000/signup` in your browser and create a user
5. You will be redirected to the home page where you can create a room
   - You can also visit `http://localhost:3000/login` to log in with an existing user
   - If you want to test the app with multiple users, open another browser window or incognito window and log in with a different user
