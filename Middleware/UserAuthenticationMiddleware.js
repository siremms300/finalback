const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const UserModel = require("../Model/UserModel");

exports.authenticateUser = async (req, res, next) => {
    const token = req.signedCookies[process.env.COOKIE_NAME];

    if (!token) {
        return next(createHttpError(401, "Unauthorized User"));
    }

    try {
        const { ID, role } = jwt.verify(token, process.env.JWT_SECRET); // Removed `role` from destructuring
        const user = await UserModel.findById({ _id: ID, role }).select("-password");

        if (!user) {
            return next(createHttpError(401, "User not found"));
        }

        req.user = user;       // Attach full user document
        req.userId = user._id; // Explicitly attach ID for convenience
        next();
    } catch (error) {
        next(createHttpError(401, "Invalid token"));
    }
};















// const createHttpError = require("http-errors");
// const jwt = require("jsonwebtoken");
// const UserModel = require("../Model/UserModel");

// exports.authenticateUser = async (req, res, next) => {
//     const token = req.signedCookies[process.env.COOKIE_NAME];

//     if (!token) {
//         next(createHttpError(401, "Unauthorized User"));
//     }
//     try {
//         const { ID, role } = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await UserModel.findOne({ _id: ID, role }).select(
//             "-password"
//         );
//         next();
//     } catch (error) {
//         next(createHttpError(401, "Unauthorized User"));
//     }
// };
