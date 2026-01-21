# SocketChat 🚀

SocketChat is a modern, real-time messaging application built with a robust Node.js backend and a sleek, glassmorphic frontend. It features secure authentication, multi-channel support, administrative dashboards, and instantaneous message delivery using WebSockets.

## ✨ Features

- **Real-time Messaging**: Instant communication powered by WebSockets (`ws`) with support for multiple themed channels.
- **Channel Management**: 
    - **Public & Private Channels**: Create unrestricted public rooms or secure private channels.
    - **Invite Links**: Secure, auto-generated invite codes and direct URLs for easy joining.
    - **Fallback Copy**: Robust clipboard support that works even on non-HTTPS/IP-based connections.
- **Administrative Control**:
    - **Owner Dashboard**: Channel creators can view member counts, join dates, and manage their rooms.
    - **Admin Dashboard**: Site-wide administrators can monitor all system activity and channels.
    - **System Notifications**: Private "User Joined/Left" alerts broadcasted exclusively to owners and admins.
- **User Experience**:
    - **Typing Indicators**: In-chat visual feedback when someone is typing.
    - **Profile Management**: View account details, joined date, and administrative status.
- **Secure Authentication**: JWT-based user login and registration with hashed passwords.


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
│   ├── chat.html           # Main multi-channel chat interface
│   ├── profile.html        # User profile & Admin link
│   ├── admin.html          # Site-wide administration portal
│   ├── login.html          # Authentication page
│   └── register.html       # Signup page
├── server/                 # Backend source code
│   ├── controllers/        # Request handlers (Auth, Channels, Messages)
│   ├── middlewares/        # Authentication & Role verification
│   ├── models/             # Mongoose schemas (User, Channel, Message)
│   ├── routes/             # API endpoints
│   └── server.js           # Entry point & WebSocket room logic
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
   Open https://socketchat-t312.onrender.com in your browser

## 🔑 Administrative Access

To promote a user to **Site Admin**, you can use the built-in development route via Postman or the browser console:

```javascript
fetch('/auth/promote-admin/YOUR_USERNAME', { method: 'POST' });
```
*Note: Once promoted, log out and log back in to refresh your security token.*

## 📄 License

This project is open-source. Feel free to contribute!
