# SocketChat 🚀

SocketChat is a modern, real-time messaging application built with a robust Node.js backend and a sleek, glassmorphic frontend. It features secure authentication, persistent chat history, and instantaneous message delivery using WebSockets.

## ✨ Features

- **Real-time Messaging**: Instant communication powered by WebSockets (`ws`).
- **Secure Authentication**: JWT-based user login and registration with hashed passwords.
- **Persistent Storage**: MongoDB for storing users and chat history.
- **Message History**: Automatic retrieval of recent chat history upon connection.
- **Modern UI**: A beautiful, responsive interface with Outfit typography and glassmorphic design.
- **Systematic Organization**: Clean separation of concerns between frontend and backend.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time**: WebSockets (`ws`)
- **Security**: JSON Web Tokens (JWT), Bcrypt
- **Frontend**: Vanilla HTML5, CSS3 (Variables, Flexbox, Animations), JavaScript (ES6+)

## 📂 Project Structure

```text
SocketChat/
├── public/                 # Frontend assets
│   ├── css/                # Stylesheets (Shared & Page-specific)
│   ├── js/                 # Client-side logic & API handlers
│   ├── index.html          # Landing page
│   ├── login.html          # Authentication page
│   ├── register.html       # Signup page
│   └── chat.html           # Main chat interface
├── server/                 # Backend source code
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Authentication & Logger middlewares
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   └── server.js           # Entry point & WebSocket logic
├── .env                    # Environment variables (Sensitive)
├── package.json            # Project dependencies & scripts
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Amulya-Poudyal/SocketChat.git
   cd SocketChat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```

4. **Run the application**:
   ```bash
   npm start
   ```

5. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Roadmap

- [ ] Support for multiple chat rooms/channels.
- [ ] Direct messaging between users.
- [ ] Profile picture uploads.
- [ ] Message reactions and emojis.

## 📄 License

This project is open-source. Feel free to contribute!