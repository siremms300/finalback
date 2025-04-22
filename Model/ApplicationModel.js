const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
        },
        resumeLink: {
            type: String,
            required: [true, "Resume link is required"],
        },
        school: {
            type: mongoose.Types.ObjectId,
            ref: "School",
            required: true,
        },
        schoolDetails: {  // Embedded school data snapshot
            university: String,
            course: String,
            location: String,
            tuition: Number,
            schoolStatus: String,
            courseType: String
        },
        applicant: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        applicantDetails: {  // Embedded user data snapshot
            username: String,
            email: String,
            role: String,
            location: String
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "accepted", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const ApplicationModel = mongoose.model("Application", ApplicationSchema);
module.exports = ApplicationModel;











// const mongoose = require("mongoose");
// const { STATUS } = require("../Utils/ApplicationConstants");

// const ApplicationSchema = new mongoose.Schema(
//     {
//         applicantId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "user",
//             required: true,
//         },
//         recruiterId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "user",
//             required: true,
//         },
//         jobId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Job",
//             required: true,
//         },
//         status: {
//             type: String,
//             enum: Object.values(STATUS),
//             default: STATUS.PENDING,
//             required: true,
//         },
//         resume: {
//             type: String,
//             required: true,
//         },
//         dateOfApplication: {
//             type: Date,
//             default: Date.now,
//         },
//         dateOfJoining: {
//             type: Date,
//             validate: [
//                 {
//                     validator: function (value) {
//                         return this.dateOfApplication <= value;
//                     },
//                     message:
//                         "dateOfJoining should be greater than dateOfApplication",
//                 },
//             ],
//         },
//     },
//     { timestamps: true }
// );

// const ApplicationModel = mongoose.model("application", ApplicationSchema);
// module.exports = ApplicationModel;
