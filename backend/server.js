// // import express from "express";
// // import "dotenv/config.js";
// // import cors from "cors";
// // import http from "http";

// const express = require("express");
// require("dotenv/config.js");
// const cors = require("cors");
// const http = require("http");
// const { connectDB } = require("./config/db.js");

// // Create Express App and Http Server.

// const app = express();
// const server = http.createServer(app);

// // Middleware Setup:

// app.use(cors());


// //Connect to MongoDB: 

// connectDB();

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log("server is Running on PORT: " + PORT);
// });

const express = require("express");
require("dotenv/config");                                    // ✅ your style
const cors = require("cors");

const http = require("http");
const morgan = require("morgan");
const helmet = require("helmet");
const { connectDB } = require("./config/db.js");            // ✅ your style
const searchRoutes = require("./routes/searchRoutes.js");
const { errorHandler, notFound } = require("./middleware/errorHandler.js");
const { generalLimiter } = require("./middleware/rateLimiter.js");

// ── Create Express App and HTTP Server ────────────────
const app = express();
const server = http.createServer(app);                      // ✅ your style

// ── Connect to MongoDB ─────────────────────────────────
connectDB();                                                // ✅ your style

// ── Security Middleware ────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────
const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://flash-deal-frontend.onrender.com",
    "https://flash-ai-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// ── Request Logger ─────────────────────────────────────
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ── Body Parser ────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── General Rate Limiter ───────────────────────────────
app.use("/api", generalLimiter);

// ── Health Check Route ─────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        message: "⚡ Flash AI API is running!",
        version: "1.0.0",
        endpoints: {
            search:       "POST   /api/search",
            history:      "GET    /api/search/history",
            clearHistory: "DELETE /api/search/history",
            deleteOne:    "DELETE /api/search/history/:id",
        },
    });
});

// ── API Routes ─────────────────────────────────────────
app.use("/api/search", searchRoutes);

// ── 404 Handler ────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ───────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;                     // ✅ your style
server.listen(PORT, () => {                                // ✅ your style
    console.log("⚡ ================================== ⚡");
    console.log("   Flash AI Server running on PORT: " + PORT);
    console.log("   URL: http://localhost:" + PORT);
    console.log("   Mode: " + (process.env.NODE_ENV || "development"));
    console.log("⚡ ================================== ⚡");
});