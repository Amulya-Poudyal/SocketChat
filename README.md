# SocketChat

SocketChat is a real-time chat application built using Node.js and MongoDB. It leverages Mongoose for data modeling and serves static assets for the client interface.

## Features

- **Real-time Communication**: Instant messaging capabilities.
- **Data Persistence**: Chat history and user data stored in MongoDB.
- **Static File Serving**: Serves the frontend application directly.

## Tech Stack

- **Runtime**: Node.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Utilities**: `serve-static`, `send`, `qs`

## Prerequisites

Ensure you have the following installed on your local machine:

- Node.js (v14 or higher recommended)
- MongoDB (Local instance or Atlas URI)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd SocketChat
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

1.  Start your MongoDB server.
2.  Run the application:
    ```bash
    npm start
    ```
    *(Note: If `npm start` is not defined, try `node index.js` or `node server.js`)*

3.  Open your browser and navigate to `http://localhost:3000` (or the port specified in the console).

## License

This project is open source.