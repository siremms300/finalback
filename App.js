const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path');
const multer = require('multer');

app.use(cookieParser(process.env.COOKIE_SECRET));

// Middlewares 
app.use(express.json());

// app.use(
//     cors({
//         origin: ["http://localhost:5173","https://scovers.org", "https://www.scovers.org", "http://195.35.25.14", "http://scovers.org"],   //http://localhost:3000:4173
//         methods: ["GET,POST,DELETE,PUT,PATCH"],
//         credentials: true,
//         allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Origin", "Accept"]
//     })
// );

app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://scovers.org",
            "https://www.scovers.org",
            "http://195.35.25.14",
            "http://scovers.org"
        ],
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        credentials: true,
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Origin",
            "Accept",
            "Cookie"
        ]
    })
);



// sudo vim /etc/nginx/sites-available/default

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
const WebinarRouter = require("./Router/WebinarRouter")
const UniversityWebinarRouter = require("./Router/UniversityWebinarRouter")
const SatRouter = require("./Router/SatRouter")
const VisitorRouter = require("./Router/VisitorRouter")
const UPIRouter = require("./Router/UPIRouter")
const BlogRouter = require("./Router/BlogRouter")
const AnalyticsRouter = require("./Router/AnalyticsRouter")

// Connecting routes
app.use("/api/v1/Schools", SchoolRouter); // Updated route for Schools
app.use("/api/v1/Users", authenticateUser, UserRouter);
app.use("/api/v1/Auth", AuthRouter);
app.use("/api/v1/Admin", authenticateUser, AdminRouter);
app.use("/api/v1/Application", authenticateUser, ApplicationRouter); 
app.use("/api/v1/Webinar", WebinarRouter);
app.use("/api/v1/upi", UPIRouter);
app.use("/api/v1/Universitywebinar", UniversityWebinarRouter);
app.use("/api/v1/Sat", SatRouter); 
app.use("/api/v1/Visitor", VisitorRouter); 
app.use("/api/v1/blogs", BlogRouter); 
app.use("/api/v1/analytics", AnalyticsRouter); 

 
// Error handling middleware for file uploads
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  next(error);
});
  
module.exports = app;




