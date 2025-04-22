
const mongoose = require("mongoose");

// Constants for educational-related data
const { SCHOOL_STATUS, COURSE_TYPE } = require("../Utils/SchoolConstants");

const SchoolSchema = new mongoose.Schema(
    {
        university: {
            type: String,
            required: [true, "A University name is required"],
            trim: true,
            minLength: [5, "University name is too short"],
            maxLength: [100, "University name is too long"],
        },
        course: {
            type: String,
            required: [true, "Course must be specified"],
            trim: true,
            minLength: [1, "Course name is too short"],
            maxLength: [200, "Course name is too long"],
        },
        schoolStatus: {
            type: String,
            enum: Object.values(SCHOOL_STATUS),
            default: SCHOOL_STATUS.UNDERGRADUATE,  // This was previously AVAILABLE 
            // default: SCHOOL_STATUS.AVAILABLE,  // This was previously AVAILABLE 
        },
        courseType: {
            type: String,
            enum: Object.values(COURSE_TYPE),
            default: COURSE_TYPE.FULL_TIME,
        },
        location: {
            type: String,
            required: [true, "University must have a location"],
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        tuition: {
            type: Number,
            required: [true, "Tuition fee is required"],
            trim: true,
        },
        scholarship: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        facilities: {
            type: [String],
            // required: [true, "Facilities are required"],
        },
        contact: {
            type: String,
            required: [true, "Contact information is required"],
            trim: true,
        },
         satScore: {
            type: Number,
            min: [400, "SAT score must be at least 400"],
            max: [1600, "SAT score cannot exceed 1600"],
        },
        toeflScore: {
            type: Number,
            min: [0, "TOEFL score must be at least 0"],
            max: [120, "TOEFL score cannot exceed 120"],
        },
        greScore: {
            type: Number,
            min: [260, "GRE score must be at least 260"],
            max: [340, "GRE score cannot exceed 340"],
        },
        studentAidAvailable: {
            type: Boolean,
            default: false, // Whether student aid is available
        },
        schoolRank: {
            type: Number,
            min: [1, "Rank must be at least 1"],
            // required: [true, "School rank is required"], // Rank of the university
        }, 
    },
    { timestamps: true } // to keep track of creation and updates
);

const SchoolModel = mongoose.model("School", SchoolSchema);
module.exports = SchoolModel;




















// const mongoose = require("mongoose");

// // Constants for educational-related data
// const { SCHOOL_STATUS, COURSE_TYPE } = require("../Utils/SchoolConstants");

// const SchoolSchema = new mongoose.Schema(
//     {
//         university: {
//             type: String,
//             required: [true, "A University name is required"],
//             trim: true,
//             minLength: [5, "University name is too short"],
//             maxLength: [100, "University name is too long"],
//         },
//         course: {
//             type: String,
//             required: [true, "Course must be specified"],
//             trim: true,
//             minLength: [1, "Course name is too short"],
//             maxLength: [200, "Course name is too long"],
//         },
//         schoolStatus: {
//             type: String,
//             enum: Object.values(SCHOOL_STATUS),
//             default: SCHOOL_STATUS.UNDERGRADUATE,  // This was previously AVAILABLE 
//             // default: SCHOOL_STATUS.AVAILABLE,  // This was previously AVAILABLE 
//         },
//         courseType: {
//             type: String,
//             enum: Object.values(COURSE_TYPE),
//             default: COURSE_TYPE.FULL_TIME,
//         },
//         location: {
//             type: String,
//             required: [true, "University must have a location"],
//         },
//         createdBy: {
//             type: mongoose.Types.ObjectId,
//             ref: "User",
//         },
//         tuition: {
//             type: Number,
//             required: [true, "Tuition fee is required"],
//             trim: true,
//         },
//         scholarship: {
//             type: Boolean,
//             default: false,
//         },
//         description: {
//             type: String,
//             required: [true, "Description is required"],
//             trim: true,
//         },
//         facilities: {
//             type: [String],
//             // required: [true, "Facilities are required"],
//         },
//         contact: {
//             type: String,
//             required: [true, "Contact information is required"],
//             trim: true,
//         },
//          satScore: {
//             type: Number,
//             min: [400, "SAT score must be at least 400"],
//             max: [1600, "SAT score cannot exceed 1600"],
//         },
//         toeflScore: {
//             type: Number,
//             min: [0, "TOEFL score must be at least 0"],
//             max: [120, "TOEFL score cannot exceed 120"],
//         },
//         greScore: {
//             type: Number,
//             min: [260, "GRE score must be at least 260"],
//             max: [340, "GRE score cannot exceed 340"],
//         },
//         studentAidAvailable: {
//             type: Boolean,
//             default: false, // Whether student aid is available
//         },
//         schoolRank: {
//             type: Number,
//             min: [1, "Rank must be at least 1"],
//             // required: [true, "School rank is required"], // Rank of the university
//         }, 
//     },
//     { timestamps: true } // to keep track of creation and updates
// );

// const SchoolModel = mongoose.model("School", SchoolSchema);
// module.exports = SchoolModel;




































































// const mongoose = require("mongoose");

// // Constants for educational-related data
// const { SCHOOL_STATUS, COURSE_TYPE } = require("../Utils/SchoolConstants");

// const SchoolSchema = new mongoose.Schema(
//     {
//         university: {
//             type: String,
//             required: [true, "A University name is required"],
//             trim: true,
//             minLength: [5, "University name is too short"],
//             maxLength: [100, "University name is too long"],
//         },
//         course: {
//             type: String,
//             required: [true, "Course must be specified"],
//             trim: true,
//             minLength: [1, "Course name is too short"],
//             maxLength: [200, "Course name is too long"],
//         },
//         schoolStatus: {
//             type: String,
//             enum: Object.values(SCHOOL_STATUS),
//             default: SCHOOL_STATUS.UNDERGRADUATE,  // This was previously AVAILABLE 
//             // default: SCHOOL_STATUS.AVAILABLE,  // This was previously AVAILABLE 
//         },
//         courseType: {
//             type: String,
//             enum: Object.values(COURSE_TYPE),
//             default: COURSE_TYPE.FULL_TIME,
//         },
//         location: {
//             type: String,
//             required: [true, "University must have a location"],
//         },
//         createdBy: {
//             type: mongoose.Types.ObjectId,
//             ref: "User",
//         },
//         tuition: {
//             type: Number,
//             required: [true, "Tuition fee is required"],
//             trim: true,
//         },
//         scholarship: {
//             type: Boolean,
//             default: false,
//         },
//         description: {
//             type: String,
//             required: [true, "Description is required"],
//             trim: true,
//         },
//         facilities: {
//             type: [String],
//             // required: [true, "Facilities are required"],
//         },
//         contact: {
//             type: String,
//             required: [true, "Contact information is required"],
//             trim: true,
//         },
//     },
//     { timestamps: true } // to keep track of creation and updates
// );

// const SchoolModel = mongoose.model("School", SchoolSchema);
// module.exports = SchoolModel;




















// const mongoose = require("mongoose");
// const { JOB_STATUS, JOB_TYPE } = require("../Utils/JobConstants");

// // const ApplicationModel = require("../Model/ApplicationModel");

// const JobSchema = new mongoose.Schema(
//     {
//         company: {
//             type: String,
//             requried: [true, "A Company name is requried"],
//             trim: true,
//             minLength: [5, "Company name is too short"],
//             maxLength: [100, "Company name is too long"],
//         },
//         position: {
//             type: String,
//             requried: [true, "Job must have a Position"],
//             trim: true,
//             minLength: [5, "Company name is too short"],
//             maxLength: [200, "Company name is too long"],
//         },
//         jobStatus: {
//             type: String,
//             enum: Object.values(JOB_STATUS),
//             default: JOB_STATUS.PENDING,
//         },
//         jobType: {
//             type: String,
//             enum: Object.values(JOB_TYPE),
//             default: JOB_TYPE.FULL_TIME,
//         },
//         jobLocation: {
//             type: String,
//             required: [true, "Job must have a location"],
//         },
//         createdBy: {
//             type: mongoose.Types.ObjectId,
//             ref: "User",
//         },
//         jobVacancy: {
//             type: String,
//             requried: [true, "Job Vacancy is requried"],
//             trim: true,
//             // minLength: [5, "Company name is too short"],
//             // maxLength: [100, "Company name is too long"],
//         },
//         jobSalary: {
//             type: String,
//             requried: [true, "Job Salary is requried"],
//             trim: true,
//             // minLength: [5, "Company name is too short"],
//             // maxLength: [100, "Company name is too long"],
//         },
//         jobDeadline: {
//             type: String,
//             requried: [true, "Job Deadline is requried"],
//             trim: true,
//             // minLength: [5, "Company name is too short"],
//             // maxLength: [100, "Company name is too long"],
//         },
//         jobDescription: {
//             type: String,
//             requried: [true, "Job Description is requried"],
//             trim: true,
//             // minLength: [5, "Company name is too short"],
//             // maxLength: [100, "Company name is too long"],
//         },
//         jobSkills: {
//             type: [],
//             requried: [true, "Job Skills is requried"],
//             trim: true,
//             // minLength: [5, "Company name is too short"],
//             // maxLength: [100, "Company name is too long"],
//         },
//         jobFacilities: {
//             type: [],
//             requried: [true, "Job facilities is requried"],
//             trim: true,
//             // minLength: [5, "Company name is too short"],
//             // maxLength: [100, "Company name is too long"],
//         },
//         jobContact: {
//             type: String,
//             requried: [true, "Job contact is requried"],
//             trim: true,
//             // minLength: [5, "Company name is too short"],
//             // maxLength: [100, "Company name is too long"],
//         },
//     },
//     { timestamps: true } // to keep track
// );

// // JobSchema.pre("remove", async function (next) {
// //     try {
// //         // 'this' refers to the job being removed
// //         await ApplicationModel.deleteMany({ jobId: this._id });
// //         next();
// //     } catch (error) {
// //         next(error);
// //     }
// // });

// const JobModel = mongoose.model("Job", JobSchema);
// module.exports = JobModel;
