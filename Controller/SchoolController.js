const SchoolModel = require("../Model/SchoolModel");
const ApplicationModel = require("../Model/ApplicationModel"); // if you have applications related to schools, otherwise remove this
const SearchLogModel = require("../Model/SearchLogModel")
const nodemailer = require("nodemailer");
const createError = require("http-errors");
const mongoose = require("mongoose");




// ------------ THIS IS THE ONE THAT WORKS BELWO -----------------------//

module.exports.getAllSchools = async (req, res, next) => {
    try {
        const filters = { ...req.query }; // copy query parameters

        // exclude these fields from filters
        const excludeFields = ["sort", "page", "limit", "fields", "search", "minTuition", "maxTuition", "scholarship", "schoolRank", "studentAidAvailable", "greScore", "toeflScore", "satScore"];
        excludeFields.forEach((field) => delete filters[field]);

        const queries = {};

        // Sorting functionality
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            queries.sortBy = sortBy;
        }

        // Select specific fields
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            queries.fields = fields;
        }

        // Set limit for pagination
        if (req.query.limit) {
            queries.limit = Number(req.query.limit);
        }

        // Search functionality with tuition and scholarship
        if (req.query.search) {
            const searchQuery = req.query.search;
            filters.$or = [
                {
                    university: {
                        $regex: new RegExp(".*" + searchQuery + ".*", "i"),
                    },
                },
                {
                    location: {
                        $regex: new RegExp(".*" + searchQuery + ".*", "i"),
                    },
                },
                {
                    course: {
                        $regex: new RegExp(".*" + searchQuery + ".*", "i"),
                    },
                },
            ];
        }

        // Tuition range filter
        if (req.query.minTuition || req.query.maxTuition) {
            filters.tuition = {};
            if (req.query.minTuition) {
                filters.tuition.$gte = Number(req.query.minTuition);
            }
            if (req.query.maxTuition) {
                filters.tuition.$lte = Number(req.query.maxTuition);
            }
        }

        // Scholarship filter
        if (req.query.scholarship) {
            filters.scholarship = req.query.scholarship === "true"; // convert string to boolean
        }

        // Pagination functionality
        if (req.query.page) {
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 5);
            const skip = (page - 1) * limit;

            queries.skip = skip;
            queries.limit = limit;
            queries.page = page;
        }

         // Rank filter
         if (req.query.schoolRank) {
            filters.schoolRank = Number(req.query.schoolRank);
        }


        // Student aid availability
        if (req.query.studentAidAvailable) {
            filters.studentAidAvailable = req.query.studentAidAvailable === "true";
        }

        // Test scores filter
        if (req.query.satScore) {
            filters.satScore = { $gte: Number(req.query.satScore) };
        }
        if (req.query.toeflScore) {
            filters.toeflScore = { $gte: Number(req.query.toeflScore) };
        }
        if (req.query.greScore) {
            filters.greScore = { $gte: Number(req.query.greScore) };
        }



        // Fetch the filtered and sorted data from the database
        const { result, totalSchools, pageCount, page } = await getSchoolData(filters, queries);

        // Response
        if (result.length !== 0) {
            res.status(200).json({
                status: true,
                result,
                totalSchools,
                currentPage: page,
                pageCount,
            });
        } else {
            next(createError(500, "School list is empty"));
        }
    } catch (error) {
        next(createError(500, error.message));
    }
};








module.exports.getMySchools = async (req, res, next) => {
    try {
        const result = await SchoolModel.find({
            createdBy: req.user._id,
        }).populate("createdBy", "username email");

        if (result?.length) {
            res.status(200).json({
                status: true,
                result,
            });
        } else {
            res.status(400).json({
                message: "School not found",
            });
        }
    } catch (error) {
        next(createError(500, `something wrong: ${error.message}`));
    }
};

















const getSchoolData = async (filters, queries) => {     // IT WAS ORIGINALLY GET AND NOT GETS 
    let sortCriteria = {};

    
    if (queries.sortBy) {
        switch (queries.sortBy) {
            case "newest":
                sortCriteria = { createdAt: -1 };
                break;
            case "oldest":
                sortCriteria = { createdAt: 1 };
                break;
            case "a-z":
                sortCriteria = { name: 1 };
                break;
            case "z-a":
                sortCriteria = { name: -1 };
                break;
            case "tuition-asc": // Sort by tuition ascending
                sortCriteria = { tuition: 1 };
                break;
            case "tuition-desc": // Sort by tuition descending
                sortCriteria = { tuition: -1 };
                break;
            default:
                sortCriteria = { createdAt: -1 };
                break;
        }
    } else {
        sortCriteria = { createdAt: -1 };
    }

    const result = await SchoolModel.find(filters)
        .skip(queries.skip)
        .limit(queries.limit)
        .sort(sortCriteria)
        .select(queries.fields);

    const totalSchools = await SchoolModel.countDocuments(filters);
    const pageCount = Math.ceil(totalSchools / queries.limit);
    return { result, totalSchools, pageCount, page: queries.page };
};




module.exports.getSingleSchool = async (req, res, next) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            next(createError(400, "Invalid School ID format"));
        }
        const result = await SchoolModel.findById(id);
        if (!result) {
            next(createError(500, "School not found"));
        } else {
            res.status(200).json({
                status: true,
                result,
            });
        }
    } catch (error) {
        next(createError(500, `something wrong: ${error.message}`));
    }
};








module.exports.addSchool = async (req, res, next) => {
    const schoolData = req.body;
    try {
        schoolData.createdBy = req?.user?._id;
        const newSchool = new SchoolModel(schoolData);
        const result = await newSchool.save();

        res.status(201).json({
            status: true,
            result,
        });
    } catch (error) {
        next(createError(500, `something went wrong: ${error.message}`));
    }
};






module.exports.addMultipleSchools = async (req, res, next) => {
    const schoolsData = req.body.schools; // Expecting an array of schools
    try {
        if (!Array.isArray(schoolsData) || schoolsData.length === 0) {
            return res.status(400).json({ message: "Please provide an array of school data" });
        }

        // Add createdBy field for each school
        const enrichedSchools = schoolsData.map((school) => ({
            ...school,
            createdBy: req?.user?._id,
        }));

        // Insert all the schools at once
        const result = await SchoolModel.insertMany(enrichedSchools);

        res.status(201).json({
            status: true,
            result,
        });
    } catch (error) {
        next(createError(500, `Something went wrong: ${error.message}`));
    }
};














module.exports.updateSingleSchool = async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            next(createError(400, "Invalid School ID format"));
        }

        const isSchoolExists = await SchoolModel.findOne({ _id: id });
        if (!isSchoolExists) {
            next(createError(500, "School not found"));
        } else {
            const updatedSchool = await SchoolModel.findByIdAndUpdate(id, data, {
                new: true,
            });
            res.status(200).json({
                status: true,
                message: "School Updated",
                result: updatedSchool,
            });
        }
    } catch (error) {
        next(createError(500, `something wrong: ${error.message}`));
    }
};

module.exports.deleteSingleSchool = async (req, res, next) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            next(createError(400, "Invalid School ID format"));
        }

        const isSchoolExists = await SchoolModel.findOne({ _id: id });
        if (!isSchoolExists) {
            res.status(500).json({
                status: false,
                message: "School not found",
            });
        } else {
            // If you have applications related to schools, delete them as well
            await ApplicationModel.deleteMany({ schoolId: id });
            const result = await SchoolModel.findByIdAndDelete(id);

            res.status(200).json({
                status: true,
                message: "School Deleted",
                result,
            });
        }
    } catch (error) {
        next(createError(500, `something wrong: ${error.message}`));
    }
};

module.exports.deleteAllSchools = async (req, res, next) => {
    try {
        result = await SchoolModel.deleteMany({});
        res.status(201).json({
            status: true,
            result,
        });
    } catch (error) {
        next(createError(500, `something wrong: ${error.message}`));
    }
};


 


// Function to format filters into a human-readable string
const formatFilters = (filters) => {
    let formattedFilters = '';

    if (filters.courseType) {
        formattedFilters += ` Course Type: ${filters.courseType.charAt(0).toUpperCase() + filters.courseType.slice(1)}\n`;
    }

    if (filters.schoolStatus) {
        formattedFilters += ` School Status: ${filters.schoolStatus.charAt(0).toUpperCase() + filters.schoolStatus.slice(1)}\n`;
    }

    if (filters.$or) {
        formattedFilters += ` Matching Fields: University, Location, or Course (Matches the search query)\n`;
    }

    if (filters.tuition) {
        if (filters.tuition.$gte && filters.tuition.$lte) {
            formattedFilters += ` Tuition Range: $${filters.tuition.$gte} - $${filters.tuition.$lte}\n`;
        } else if (filters.tuition.$gte) {
            formattedFilters += ` Minimum Tuition: $${filters.tuition.$gte}\n`;
        } else if (filters.tuition.$lte) {
            formattedFilters += ` Maximum Tuition: $${filters.tuition.$lte}\n`;
        }
    }

    if (filters.scholarship !== undefined) {
        formattedFilters += ` Scholarship: ${filters.scholarship ? 'Available' : 'Not Available'}\n`;
    }



    if (filters.studentAidAvailable !== undefined) {
        formattedFilters += ` Student Aid: ${filters.studentAidAvailable ? 'Available' : 'Not Available'}\n`;
    }

    if (filters.greScore) {
        formattedFilters += ` GRE Score: ${filters.greScore}\n`;
    }

    if (filters.toeflScore) {
        formattedFilters += ` TOEFL Score: ${filters.toeflScore}\n`;
    }

    if (filters.satScore) {
        formattedFilters += ` SAT Score: ${filters.satScore}\n`;
    }




    return formattedFilters.trim();
};





// SEND EMAIL 
// Configure Nodemailer with Titan Email
const transporter = nodemailer.createTransport({
    host: "smtp.titan.email",
    port: 587, // TLS port
    secure: false, // Use TLS
    auth: {
        user: "info@scovers.org", // Your Titan email
        pass: "Scoversedu1@", // Your Titan email password
    },
});

// Function to send search parameters via email
const sendSearchParametersEmail = async (searchLog) => {
    const { searchQuery, filters, userId, ipAddress, email, phone } = searchLog;

    // <p><strong>Filters:</strong> ${JSON.stringify(filters)}</p>
    const emailContent = `
        <h2>A New Search Has Been Made</h2>
        <p><strong>Course:</strong> ${searchQuery || "None"}</p>
        <p><strong>Search Parameters:</strong></p>
        <pre>${formatFilters(filters)}</pre>
        <p><strong>User ID:</strong> ${userId || "Guest"}</p>
        <p><strong>IP Address:</strong> ${ipAddress || "Unknown"}</p>
        <p><strong>Email:</strong> ${email || "Not Provided"}</p>
        <p><strong>Phone:</strong> ${phone || "Not Provided"}</p>
        <p><b>Search Date and Time:</b> ${new Date().toLocaleString()}</p>
    `;

    const mailOptions = {
        from: '"Scovers Search Logs" <info@scovers.org>',
        to: "info@scovers.org",
        subject: "A User Just Searched for a Course",
        html: emailContent, // Use the HTML body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to info@scovers.org!");
    } catch (error) {
        console.error("Failed to send email:", error.message);
    }
};


 








 


const getFilteredSchools = async (filters, queries) => {
    let sortCriteria = {};

    // Sorting logic based on queries
    if (queries.sortBy) {
        switch (queries.sortBy) {
            case "newest":
                sortCriteria = { createdAt: -1 };
                break;
            case "oldest":
                sortCriteria = { createdAt: 1 };
                break;
            case "a-z":
                sortCriteria = { name: 1 };
                break;
            case "z-a":
                sortCriteria = { name: -1 };
                break;
            case "tuition-asc":
                sortCriteria = { tuition: 1 };
                break;
            case "tuition-desc":
                sortCriteria = { tuition: -1 };
                break;
            default:
                sortCriteria = { createdAt: -1 };
                break;
        }
    } else {
        sortCriteria = { createdAt: -1 };
    }

    // Find filtered and sorted schools with pagination
    const result = await SchoolModel.find(filters)
        .skip(queries.skip)
        .limit(queries.limit)
        .sort(sortCriteria)
        .select(queries.fields);

    const totalSchools = await SchoolModel.countDocuments(filters);
    const pageCount = Math.ceil(totalSchools / queries.limit);

    return { result, totalSchools, pageCount, page: queries.page };
};



 



module.exports.getSearchedAndFilteredSchools = async (req, res, next) => {
    try {
        // Extract email and phone from REQUEST BODY
        const { email, phone } = req.body;
        
        // Extract all other parameters from QUERY STRING
        const { 
            search,
            courseType,
            schoolStatus,
            // These will be logged but not used for filtering
            minTuition, 
            maxTuition, 
            scholarship,
            studentAidAvailable,
            greScore,
            toeflScore,
            satScore,
            schoolRank,
            sort,
            page: queryPage,
            limit: queryLimit,
            fields,
            ...otherParams
        } = req.query;

        // Initialize filters with ONLY the allowed filtering fields
        const filters = {};
        
        // Apply only these filters to the query
        if (courseType) filters.courseType = courseType;
        if (schoolStatus) filters.schoolStatus = schoolStatus;
        
        // Search functionality
        if (search) {
            filters.$or = [
                { university: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { location: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { course: { $regex: new RegExp(".*" + search + ".*", "i") } }
            ];
        }

        // Set up queries for sorting/pagination
        const queries = {};
        
        // Sorting
        if (sort) {
            queries.sortBy = sort;
        }
        
        // Field selection
        if (fields) {
            queries.fields = fields.split(",").join(" ");
        }
        
        // Pagination
        const page = Number(queryPage) || 1;
        const limit = Number(queryLimit) || 5;
        const skip = (page - 1) * limit;
        
        queries.skip = skip;
        queries.limit = limit;
        queries.page = page;

        // Get filtered results (only using courseType, schoolStatus, and search)
        const { result, totalSchools, pageCount } = await getFilteredSchools(filters, queries);

        // Create search log with ALL parameters
        const searchLog = new SearchLogModel({
            searchQuery: search || null,
            filters: {
                // Filtering parameters
                ...(courseType && { courseType }),
                ...(schoolStatus && { schoolStatus }),
                // Non-filtering parameters (for analytics)
                ...(minTuition && { minTuition: Number(minTuition) }),
                ...(maxTuition && { maxTuition: Number(maxTuition) }),
                ...(scholarship && { scholarship: scholarship === "true" }),
                ...(studentAidAvailable && { studentAidAvailable: studentAidAvailable === "true" }),
                ...(greScore && { greScore: Number(greScore) }),
                ...(toeflScore && { toeflScore: Number(toeflScore) }),
                ...(satScore && { satScore: Number(satScore) }),
                ...(schoolRank && { schoolRank: Number(schoolRank) })
            },
            userId: req.user?._id || null,
            ipAddress: req.ip,
            email: email || null,  // Now from request body
            phone: phone || null   // Now from request body
        });
        
        await searchLog.save();
        await sendSearchParametersEmail(searchLog);

        // Response
        if (result.length > 0) {
            res.status(200).json({
                status: true,
                result,
                totalSchools,
                currentPage: page,
                pageCount,
            });
        } else {
            next(createError(404, "No schools found with the provided criteria"));
        }
    } catch (error) {
        next(createError(500, error.message));
    }
};

















































































































































































































































// const SchoolModel = require("../Model/SchoolModel");
// const ApplicationModel = require("../Model/ApplicationModel"); // if you have applications related to schools, otherwise remove this
// const SearchLogModel = require("../Model/SearchLogModel")
// const nodemailer = require("nodemailer");
// const createError = require("http-errors");
// const mongoose = require("mongoose");




// // ------------ THIS IS THE ONE THAT WORKS BELWO -----------------------//

// module.exports.getAllSchools = async (req, res, next) => {
//     try {
//         const filters = { ...req.query }; // copy query parameters

//         // exclude these fields from filters
//         const excludeFields = ["sort", "page", "limit", "fields", "search", "minTuition", "maxTuition", "scholarship", "schoolRank", "studentAidAvailable", "greScore", "toeflScore", "satScore"];
//         excludeFields.forEach((field) => delete filters[field]);

//         const queries = {};

//         // Sorting functionality
//         if (req.query.sort) {
//             const sortBy = req.query.sort.split(",").join(" ");
//             queries.sortBy = sortBy;
//         }

//         // Select specific fields
//         if (req.query.fields) {
//             const fields = req.query.fields.split(",").join(" ");
//             queries.fields = fields;
//         }

//         // Set limit for pagination
//         if (req.query.limit) {
//             queries.limit = Number(req.query.limit);
//         }

//         // Search functionality with tuition and scholarship
//         if (req.query.search) {
//             const searchQuery = req.query.search;
//             filters.$or = [
//                 {
//                     university: {
//                         $regex: new RegExp(".*" + searchQuery + ".*", "i"),
//                     },
//                 },
//                 {
//                     location: {
//                         $regex: new RegExp(".*" + searchQuery + ".*", "i"),
//                     },
//                 },
//                 {
//                     course: {
//                         $regex: new RegExp(".*" + searchQuery + ".*", "i"),
//                     },
//                 },
//             ];
//         }

//         // Tuition range filter
//         if (req.query.minTuition || req.query.maxTuition) {
//             filters.tuition = {};
//             if (req.query.minTuition) {
//                 filters.tuition.$gte = Number(req.query.minTuition);
//             }
//             if (req.query.maxTuition) {
//                 filters.tuition.$lte = Number(req.query.maxTuition);
//             }
//         }

//         // Scholarship filter
//         if (req.query.scholarship) {
//             filters.scholarship = req.query.scholarship === "true"; // convert string to boolean
//         }

//         // Pagination functionality
//         if (req.query.page) {
//             const page = Number(req.query.page || 1);
//             const limit = Number(req.query.limit || 5);
//             const skip = (page - 1) * limit;

//             queries.skip = skip;
//             queries.limit = limit;
//             queries.page = page;
//         }

//          // Rank filter
//          if (req.query.schoolRank) {
//             filters.schoolRank = Number(req.query.schoolRank);
//         }


//         // Student aid availability
//         if (req.query.studentAidAvailable) {
//             filters.studentAidAvailable = req.query.studentAidAvailable === "true";
//         }

//         // Test scores filter
//         if (req.query.satScore) {
//             filters.satScore = { $gte: Number(req.query.satScore) };
//         }
//         if (req.query.toeflScore) {
//             filters.toeflScore = { $gte: Number(req.query.toeflScore) };
//         }
//         if (req.query.greScore) {
//             filters.greScore = { $gte: Number(req.query.greScore) };
//         }



//         // Fetch the filtered and sorted data from the database
//         const { result, totalSchools, pageCount, page } = await getSchoolData(filters, queries);

//         // Response
//         if (result.length !== 0) {
//             res.status(200).json({
//                 status: true,
//                 result,
//                 totalSchools,
//                 currentPage: page,
//                 pageCount,
//             });
//         } else {
//             next(createError(500, "School list is empty"));
//         }
//     } catch (error) {
//         next(createError(500, error.message));
//     }
// };








// module.exports.getMySchools = async (req, res, next) => {
//     try {
//         const result = await SchoolModel.find({
//             createdBy: req.user._id,
//         }).populate("createdBy", "username email");

//         if (result?.length) {
//             res.status(200).json({
//                 status: true,
//                 result,
//             });
//         } else {
//             res.status(400).json({
//                 message: "School not found",
//             });
//         }
//     } catch (error) {
//         next(createError(500, `something wrong: ${error.message}`));
//     }
// };

















// const getSchoolData = async (filters, queries) => {     // IT WAS ORIGINALLY GET AND NOT GETS 
//     let sortCriteria = {};

    
//     if (queries.sortBy) {
//         switch (queries.sortBy) {
//             case "newest":
//                 sortCriteria = { createdAt: -1 };
//                 break;
//             case "oldest":
//                 sortCriteria = { createdAt: 1 };
//                 break;
//             case "a-z":
//                 sortCriteria = { name: 1 };
//                 break;
//             case "z-a":
//                 sortCriteria = { name: -1 };
//                 break;
//             case "tuition-asc": // Sort by tuition ascending
//                 sortCriteria = { tuition: 1 };
//                 break;
//             case "tuition-desc": // Sort by tuition descending
//                 sortCriteria = { tuition: -1 };
//                 break;
//             default:
//                 sortCriteria = { createdAt: -1 };
//                 break;
//         }
//     } else {
//         sortCriteria = { createdAt: -1 };
//     }

//     const result = await SchoolModel.find(filters)
//         .skip(queries.skip)
//         .limit(queries.limit)
//         .sort(sortCriteria)
//         .select(queries.fields);

//     const totalSchools = await SchoolModel.countDocuments(filters);
//     const pageCount = Math.ceil(totalSchools / queries.limit);
//     return { result, totalSchools, pageCount, page: queries.page };
// };




// module.exports.getSingleSchool = async (req, res, next) => {
//     const { id } = req.params;
//     try {
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             next(createError(400, "Invalid School ID format"));
//         }
//         const result = await SchoolModel.findById(id);
//         if (!result) {
//             next(createError(500, "School not found"));
//         } else {
//             res.status(200).json({
//                 status: true,
//                 result,
//             });
//         }
//     } catch (error) {
//         next(createError(500, `something wrong: ${error.message}`));
//     }
// };






// module.exports.addSchool = async (req, res, next) => {
//     const schoolData = req.body;
//     try {
//         schoolData.createdBy = req?.user?._id;
//         const newSchool = new SchoolModel(schoolData);
//         const result = await newSchool.save();

//         res.status(201).json({
//             status: true,
//             result,
//         });
//     } catch (error) {
//         next(createError(500, `something went wrong: ${error.message}`));
//     }
// };






// module.exports.addMultipleSchools = async (req, res, next) => {
//     const schoolsData = req.body.schools; // Expecting an array of schools
//     try {
//         if (!Array.isArray(schoolsData) || schoolsData.length === 0) {
//             return res.status(400).json({ message: "Please provide an array of school data" });
//         }

//         // Add createdBy field for each school
//         const enrichedSchools = schoolsData.map((school) => ({
//             ...school,
//             createdBy: req?.user?._id,
//         }));

//         // Insert all the schools at once
//         const result = await SchoolModel.insertMany(enrichedSchools);

//         res.status(201).json({
//             status: true,
//             result,
//         });
//     } catch (error) {
//         next(createError(500, `Something went wrong: ${error.message}`));
//     }
// };














// module.exports.updateSingleSchool = async (req, res, next) => {
//     const { id } = req.params;
//     const data = req.body;
//     try {
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             next(createError(400, "Invalid School ID format"));
//         }

//         const isSchoolExists = await SchoolModel.findOne({ _id: id });
//         if (!isSchoolExists) {
//             next(createError(500, "School not found"));
//         } else {
//             const updatedSchool = await SchoolModel.findByIdAndUpdate(id, data, {
//                 new: true,
//             });
//             res.status(200).json({
//                 status: true,
//                 message: "School Updated",
//                 result: updatedSchool,
//             });
//         }
//     } catch (error) {
//         next(createError(500, `something wrong: ${error.message}`));
//     }
// };

// module.exports.deleteSingleSchool = async (req, res, next) => {
//     const { id } = req.params;
//     try {
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             next(createError(400, "Invalid School ID format"));
//         }

//         const isSchoolExists = await SchoolModel.findOne({ _id: id });
//         if (!isSchoolExists) {
//             res.status(500).json({
//                 status: false,
//                 message: "School not found",
//             });
//         } else {
//             // If you have applications related to schools, delete them as well
//             await ApplicationModel.deleteMany({ schoolId: id });
//             const result = await SchoolModel.findByIdAndDelete(id);

//             res.status(200).json({
//                 status: true,
//                 message: "School Deleted",
//                 result,
//             });
//         }
//     } catch (error) {
//         next(createError(500, `something wrong: ${error.message}`));
//     }
// };

// module.exports.deleteAllSchools = async (req, res, next) => {
//     try {
//         result = await SchoolModel.deleteMany({});
//         res.status(201).json({
//             status: true,
//             result,
//         });
//     } catch (error) {
//         next(createError(500, `something wrong: ${error.message}`));
//     }
// };


 


// // Function to format filters into a human-readable string
// const formatFilters = (filters) => {
//     let formattedFilters = '';

//     if (filters.courseType) {
//         formattedFilters += ` Course Type: ${filters.courseType.charAt(0).toUpperCase() + filters.courseType.slice(1)}\n`;
//     }

//     if (filters.schoolStatus) {
//         formattedFilters += ` School Status: ${filters.schoolStatus.charAt(0).toUpperCase() + filters.schoolStatus.slice(1)}\n`;
//     }

//     if (filters.$or) {
//         formattedFilters += ` Matching Fields: University, Location, or Course (Matches the search query)\n`;
//     }

//     if (filters.tuition) {
//         if (filters.tuition.$gte && filters.tuition.$lte) {
//             formattedFilters += ` Tuition Range: $${filters.tuition.$gte} - $${filters.tuition.$lte}\n`;
//         } else if (filters.tuition.$gte) {
//             formattedFilters += ` Minimum Tuition: $${filters.tuition.$gte}\n`;
//         } else if (filters.tuition.$lte) {
//             formattedFilters += ` Maximum Tuition: $${filters.tuition.$lte}\n`;
//         }
//     }

//     if (filters.scholarship !== undefined) {
//         formattedFilters += ` Scholarship: ${filters.scholarship ? 'Available' : 'Not Available'}\n`;
//     }



//     if (filters.studentAidAvailable !== undefined) {
//         formattedFilters += ` Student Aid: ${filters.studentAidAvailable ? 'Available' : 'Not Available'}\n`;
//     }

//     if (filters.greScore) {
//         formattedFilters += ` GRE Score: ${filters.greScore}\n`;
//     }

//     if (filters.toeflScore) {
//         formattedFilters += ` TOEFL Score: ${filters.toeflScore}\n`;
//     }

//     if (filters.satScore) {
//         formattedFilters += ` SAT Score: ${filters.satScore}\n`;
//     }




//     return formattedFilters.trim();
// };





// // SEND EMAIL 
// // Configure Nodemailer with Titan Email
// const transporter = nodemailer.createTransport({
//     host: "smtp.titan.email",
//     port: 587, // TLS port
//     secure: false, // Use TLS
//     auth: {
//         user: "info@scovers.org", // Your Titan email
//         pass: "Scoversedu1@", // Your Titan email password
//     },
// });

// // Function to send search parameters via email
// const sendSearchParametersEmail = async (searchLog) => {
//     const { searchQuery, filters, userId, ipAddress, email, phone } = searchLog;

//     // <p><strong>Filters:</strong> ${JSON.stringify(filters)}</p>
//     const emailContent = `
//         <h2>A New Search Has Been Made</h2>
//         <p><strong>Course:</strong> ${searchQuery || "None"}</p>
//         <p><strong>Search Parameters:</strong></p>
//         <pre>${formatFilters(filters)}</pre>
//         <p><strong>User ID:</strong> ${userId || "Guest"}</p>
//         <p><strong>IP Address:</strong> ${ipAddress || "Unknown"}</p>
//         <p><strong>Email:</strong> ${email || "Not Provided"}</p>
//         <p><strong>Phone:</strong> ${phone || "Not Provided"}</p>
//         <p><b>Search Date and Time:</b> ${new Date().toLocaleString()}</p>
//     `;

//     const mailOptions = {
//         from: '"Scovers Search Logs" <info@scovers.org>',
//         to: "info@scovers.org",
//         subject: "A User Just Searched for a Course",
//         html: emailContent, // Use the HTML body
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log("Email sent successfully to info@scovers.org!");
//     } catch (error) {
//         console.error("Failed to send email:", error.message);
//     }
// };


 














 

// const getFilteredSchools = async (filters, queries) => {
//     let sortCriteria = {};

//     // Sorting logic based on queries
//     if (queries.sortBy) {
//         switch (queries.sortBy) {
//             case "newest":
//                 sortCriteria = { createdAt: -1 };
//                 break;
//             case "oldest":
//                 sortCriteria = { createdAt: 1 };
//                 break;
//             case "a-z":
//                 sortCriteria = { name: 1 };
//                 break;
//             case "z-a":
//                 sortCriteria = { name: -1 };
//                 break;
//             case "tuition-asc":
//                 sortCriteria = { tuition: 1 };
//                 break;
//             case "tuition-desc":
//                 sortCriteria = { tuition: -1 };
//                 break;
//             default:
//                 sortCriteria = { createdAt: -1 };
//                 break;
//         }
//     } else {
//         sortCriteria = { createdAt: -1 };
//     }

//     // Find filtered and sorted schools with pagination
//     const result = await SchoolModel.find(filters)
//         .skip(queries.skip)
//         .limit(queries.limit)
//         .sort(sortCriteria)
//         .select(queries.fields);

//     const totalSchools = await SchoolModel.countDocuments(filters);
//     const pageCount = Math.ceil(totalSchools / queries.limit);

//     return { result, totalSchools, pageCount, page: queries.page };
// };

// module.exports.getSearchedAndFilteredSchools = async (req, res, next) => {
//     try {
//         const filters = { ...req.query };
//         const { email, phone } = req.body;

//         // Exclude these fields from filters
//         const excludeFields = [
//             "sort",
//             "page",
//             "limit",
//             "fields",
//             "search",
//             "minTuition",
//             "maxTuition",
//             "scholarship",
//             "studentAidAvailable",
//             "greScore",
//             "toeflScore",
//             "satScore",
//             // "email",
//             // "phone",
//         ];
//         excludeFields.forEach((field) => delete filters[field]);

//         const queries = {};

//         // Sorting functionality
//         if (req.query.sort) {
//             queries.sortBy = req.query.sort;
//         }

//         // Select specific fields
//         if (req.query.fields) {
//             queries.fields = req.query.fields.split(",").join(" ");
//         }

//         // Pagination parameters
//         const page = Number(req.query.page) || 1;
//         const limit = Number(req.query.limit) || 5;
//         const skip = (page - 1) * limit;

//         queries.skip = skip;
//         queries.limit = limit;
//         queries.page = page;

//         // Search functionality with tuition and scholarship
//         if (req.query.search) {
//             const searchQuery = req.query.search;
//             filters.$or = [
//                 {
//                     university: {
//                         $regex: new RegExp(".*" + searchQuery + ".*", "i"),
//                     },
//                 },
//                 {
//                     location: {
//                         $regex: new RegExp(".*" + searchQuery + ".*", "i"),
//                     },
//                 },
//                 {
//                     course: {
//                         $regex: new RegExp(".*" + searchQuery + ".*", "i"),
//                     },
//                 },
//             ];
//         }

//         // Tuition range filter
//         if (req.query.minTuition || req.query.maxTuition) {
//             filters.tuition = {};
//             if (req.query.minTuition) {
//                 filters.tuition.$gte = Number(req.query.minTuition);
//             }
//             if (req.query.maxTuition) {
//                 filters.tuition.$lte = Number(req.query.maxTuition);
//             }
//         }

//         // Scholarship filter
//         if (req.query.scholarship) {
//             filters.scholarship = req.query.scholarship === "true"; // convert string to boolean
//         }

//         // Student Aid filter
//         if (req.query.studentAidAvailable) {
//             filters.studentAidAvailable = req.query.studentAidAvailable === "true"; // convert string to boolean
//         }

//         // GRE Score filter
//         if (req.query.greScore) {
//             filters.greScore = { $gte: Number(req.query.greScore) }; // GRE score must meet or exceed the provided value
//         }

//         // TOEFL Score filter
//         if (req.query.toeflScore) {
//             filters.toeflScore = { $gte: Number(req.query.toeflScore) }; // TOEFL score must meet or exceed the provided value
//         }

//         // SAT Score filter
//         if (req.query.satScore) {
//             filters.satScore = { $gte: Number(req.query.satScore) }; // SAT score must meet or exceed the provided value
//         }

//         // Fetch the filtered and sorted data from the database
//         const { result, totalSchools, pageCount, page: currentPage } = await getFilteredSchools(filters, queries);

//         // Log the search data to the database
//         const searchLog = new SearchLogModel({
//             searchQuery: req.query.search || null,
//             filters,
//             userId: req.user?._id || null, // Capture user ID if logged in
//             ipAddress: req.ip,
//             email: req.body.email || null, // Log email
//             phone: req.body.phone || null, // Log phone 
//         });
//         await searchLog.save(); 
//         console.log("Search Log:", searchLog); 

  
//         // Send email with search parameters
//         await sendSearchParametersEmail(searchLog);

//         // Response
//         if (result.length !== 0) {
//             res.status(200).json({
//                 status: true,
//                 result,
//                 totalSchools,
//                 currentPage,
//                 pageCount,
//             });
//         } else {
//             next(createError(404, "No schools found with the provided search or filter criteria"));
//         }
//     } catch (error) {
//         next(createError(500, error.message));
//     }
// };


