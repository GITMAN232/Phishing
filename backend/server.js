const express = require("express");
const http = require("http");   // Needed to attach both Express and Socket.IO to same server
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const { getDb } = require("./database");

dotenv.config();

const app = express();
const httpServer = http.createServer(app); // Create raw HTTP server from Express app

// Attach Socket.IO to the same HTTP server, allowing cross-origin from frontend
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Make `io` available anywhere in the app via req.app.get("io")
app.set("io", io);

// Middleware
app.use(express.json());
app.use(cors());
app.set('trust proxy', true);

// Initialize Database
getDb()
    .then(() => console.log("✅ SQLite connected and schema initialized"))
    .catch(err => console.error("❌ Database connection error:", err));

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

// Socket.IO connection event (useful for debugging)
io.on("connection", (socket) => {
    console.log(`🔌 Admin connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`🔌 Admin disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`⚡ Server running on port ${PORT}`);
});
