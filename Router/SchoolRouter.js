  
const express = require("express");
const SchoolRouter = express.Router(); // create a router

// Controllers
const SchoolController = require("../Controller/SchoolController");
const { checkSchoolInput } = require("../Validation/SchoolDataRules");
const {
    inputValidationMiddleware,
} = require("../Validation/ValidationMiddleware");

const {
    userAuthorizationHandler,
} = require("./../Middleware/UserAuthorizationMiddleware");

// Routes
SchoolRouter.route("/")
    .get(SchoolController.getAllSchools)
    .post(
        userAuthorizationHandler("recruiter"),
        checkSchoolInput,
        inputValidationMiddleware,
        SchoolController.addSchool
    )
.delete(SchoolController.deleteAllSchools);



// Separate route for filtering and searching schools
SchoolRouter.route("/search")
    .get(SchoolController.getSearchedAndFilteredSchools); 



// Route for bulk insertion of schools
SchoolRouter.route("/bulk")
    .post(
        userAuthorizationHandler("recruiter"),
        SchoolController.addMultipleSchools
);


SchoolRouter.get("/my-schools", SchoolController.getMySchools);
SchoolRouter.route("/:id")
    .get(SchoolController.getSingleSchool)
    .patch(
        userAuthorizationHandler("recruiter"),
        checkSchoolInput,
        inputValidationMiddleware,
        SchoolController.updateSingleSchool
    )
    .delete(
        userAuthorizationHandler("recruiter"),
        SchoolController.deleteSingleSchool
    );

module.exports = SchoolRouter;














// const express = require("express");
// const SchoolRouter = express.Router(); // create a router

// // Controllers
// const SchoolController = require("../Controller/SchoolController");
// const { checkSchoolInput } = require("../Validation/SchoolDataRules");
// const {
//     inputValidationMiddleware,
// } = require("../Validation/ValidationMiddleware");

// // Routes
// SchoolRouter.route("/")
//     .get(SchoolController.getAllSchools)
//     .post(
//         checkSchoolInput,
//         inputValidationMiddleware,
//         SchoolController.addSchool
//     )
//     .delete(SchoolController.deleteAllSchools);

// // Separate route for filtering and searching schools
// SchoolRouter.route("/search")
//     .get(SchoolController.getSearchedAndFilteredSchools);

// // Route for bulk insertion of schools
// SchoolRouter.route("/bulk")
//     .post(SchoolController.addMultipleSchools);

// SchoolRouter.get("/my-schools", SchoolController.getMySchools);
// SchoolRouter.route("/:id")
//     .get(SchoolController.getSingleSchool)
//     .patch(
//         checkSchoolInput,
//         inputValidationMiddleware,
//         SchoolController.updateSingleSchool
//     )
//     .delete(SchoolController.deleteSingleSchool);

// module.exports = SchoolRouter;


























// const express = require("express");
// const JobRouter = express.Router(); // create a router

// // Controllers
// const JobController = require("../Controller/JobController");
// const { checkJobInput } = require("../Validation/JobDataRules");
// const {
//     inputValidationMiddleware,
// } = require("../Validation/ValidationMiddleware");

// const {
//     userAuthorizationHandler,
// } = require("../Middleware/UserAuthorizationMiddleware");

// // Routes
// JobRouter.route("/")
//     .get(JobController.getAllJobs)
//     .post(
//         userAuthorizationHandler("recruiter"),
//         checkJobInput,
//         inputValidationMiddleware,
//         JobController.addJob
//     )
//     .delete(JobController.deleteAllJobs);

// JobRouter.get("/my-jobs", JobController.getMyJobs);
// JobRouter.route("/:id")
//     .get(JobController.getSingleJob)
//     .patch(
//         userAuthorizationHandler("recruiter"),
//         checkJobInput,
//         inputValidationMiddleware,
//         JobController.updateSingleJob
//     )
//     .delete(
//         userAuthorizationHandler("recruiter"),
//         JobController.deleteSingleJob
//     );

// module.exports = JobRouter;

// // Extra----------------------------
// // JobRouter.get("/", JobController.getAllJobs); //Get all jobs
// // JobRouter.post("/", JobController.addJob); //Add all jobs
// // JobRouter.get("/:id", JobController.getSingleJob); //Get Single all jobs
