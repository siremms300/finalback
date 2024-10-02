const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cookieParser(process.env.COOKIE_SECRET));

// Middlewares
app.use(express.json());
app.use(
    cors({
        // origin: ["http://localhost:5173"], //localhost IP 
        origin: ["http://195.35.25.14:4173"], // Your frontend IP
        methods: ["GET,POST,DELETE,PUT,PATCH"],
        credentials: true,
    })
);

// Custom Middlewares
const {
    authenticateUser,
} = require("./Middleware/UserAuthenticationMiddleware");

// Routers
const SchoolRouter = require("./Router/SchoolRouter"); // Updated to SchoolRouter
const UserRouter = require("./Router/UserRouter");
const AuthRouter = require("./Router/AuthRouter");
const AdminRouter = require("./Router/AdminRouter");
const ApplicationRouter = require("./Router/ApplicationRouter");

// Connecting routes
app.use("/api/v1/Schools", authenticateUser, SchoolRouter); // Updated route for Schools
app.use("/api/v1/Users", authenticateUser, UserRouter);
app.use("/api/v1/Auth", AuthRouter);
app.use("/api/v1/Admin", authenticateUser, AdminRouter);
app.use("/api/v1/Application", authenticateUser, ApplicationRouter);

module.exports = app;




