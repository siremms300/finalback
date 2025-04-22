// const mongoose = require("mongoose");
// const dotenv = require("dotenv").config();
// const app = require("./App");

// // DB Connection
// const DBConnectionHandler = require("./Utils/DBconnect");
// DBConnectionHandler();
// const port = process.env.PORT || 3000;
// // const host = 'http://localhost:3000';

// app.get("/", (req, res) => { 
//     res.send("Scovers Server is running!");
// }); 
// // 404 Error handler
// app.use("*", (req, res) => {
//     res.status(404).json({ message: "Not Found" });
// });

// // Error Handeling Middleware(default synchronous error handling middleware from express)
// app.use((err, req, res, next) => {
//     if (res.headersSent) {
//         next("There was a problem");
//     } else {
//         if (err.message) { 
//             res.status(err.status || 500).send(err.message);
//         } else {
//             res.status(500).send("Something went wrong");
//         }
//     } 
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`); 
//     // console.log(`Server is running on ${host}:${port}`);
// });


// // require = require("esm")(module) 
// // module.exports = require("./index.js")














const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const app = require("./App");

// DB Connection
const DBConnectionHandler = require("./Utils/DBconnect");
DBConnectionHandler();
const port = process.env.PORT || 3000;
// const host = 'http://localhost:3000';

app.get("/", (req, res) => { 
    res.send("Scovers Server is running!");
}); 
// 404 Error handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
});

// Error Handeling Middleware(default synchronous error handling middleware from express)
app.use((err, req, res, next) => {
    if (res.headersSent) {
        next("There was a problem");
    } else {
        if (err.message) { 
            res.status(err.status || 500).send(err.message);
        } else {
            res.status(500).send("Something went wrong");
        }
    } 
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
    // console.log(`Server is running on ${host}:${port}`);
});


// require = require("esm")(module) 
// module.exports = require("./index.js")