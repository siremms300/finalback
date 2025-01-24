
const mongoose = require("mongoose");

const SearchLogSchema = new mongoose.Schema(
    {
        searchQuery: {
            type: String,
            default: null,
        },
        filters: {
            type: Object,
            default: {},
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            default: null,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        email: {
            type: String, // Added email field
            default: null,
        },
        phone: {
            type: String, // Added phone field
            default: null,
        },
    },
    { timestamps: true } // Tracks when the search was made
);

const SearchLogModel = mongoose.model("SearchLog", SearchLogSchema);
module.exports = SearchLogModel;

