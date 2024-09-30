const SchoolModel = require("../Model/SchoolModel");
const ApplicationModel = require("../Model/ApplicationModel"); // if you have applications related to schools, otherwise remove this

const createError = require("http-errors");
const mongoose = require("mongoose");




// ------------ THIS IS THE ONE THAT WORKS BELWO -----------------------//

module.exports.getAllSchools = async (req, res, next) => {
    try {
        const filters = { ...req.query }; // copy query parameters

        // exclude these fields from filters
        const excludeFields = ["sort", "page", "limit", "fields", "search", "minTuition", "maxTuition", "scholarship"];
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









// module.exports.getAllSchools = async (req, res, next) => {
//     try {
//         const filters = { ...req.query }; // copy query parameters

//         // exclude these fields from filters
//         const excludeFields = ["sort", "page", "limit", "fields", "search", "minTuition", "maxTuition"];
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

//         // Pagination functionality
//         if (req.query.page) {
//             const page = Number(req.query.page || 1);
//             const limit = Number(req.query.limit || 5);
//             const skip = (page - 1) * limit;

//             queries.skip = skip;
//             queries.limit = limit;
//             queries.page = page;
//         }

//         // Fetch the filtered and sorted data from the database
//         const { result, totalSchools, pageCount, page } = await getSchoolData(
//             filters,
//             queries
//         );

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












// ---------------    WE WILL COME BACK TO THIS CHECK --------------------

// module.exports.addSchool = async (req, res, next) => {
//     const schoolData = req.body;
//     try {
//         const isSchoolExists = await SchoolModel.findOne({
//             name: schoolData.name,
//         });
//         if (isSchoolExists) {
//             next(createError(500, "School data already exists"));
//         } else {
//             schoolData.createdBy = req?.user?._id;
//             const newSchool = new SchoolModel(schoolData);
//             const result = await newSchool.save();

//             res.status(201).json({
//                 status: true,
//                 result,
//             });
//         }
//     } catch (error) {
//         next(createError(500, `something wrong: ${error.message}`));
//     }
// };





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

















// DETAILS BASED ON SEARCH - THE CODE BELOW IS ACCURATE WITH SEARCH AND FILTER BUT LACKS PAGINATION 

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

//         const filters = { ...req.query }; // copy query parameters

//         // exclude these fields from filters
//         const excludeFields = ["sort", "page", "limit", "fields", "search", "minTuition", "maxTuition", "scholarship"];
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
//             queries.limit = Number(req.query.limit) || 5;
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



//         // Fetch the filtered and sorted data from the database
//         const { result, totalSchools, pageCount, page } = await getFilteredSchools(filters, queries);

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
//             next(createError(500, "No schools found with the provided search or filter criteria"));
//         }
//     } catch (error) {
//         next(createError(500, error.message));
//     }
// };






















// THE CODE BELOW HAS PAGINATION BUT INACCURATE IN SEARCH AND FILTER 


// const getFilteredSchools = async (filters, queries) => {
//     let sortCriteria = {};

//     // Sorting logic
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
//         const excludeFields = ["sort", "page", "limit", "fields", "search", "minTuition", "maxTuition", "scholarship"];
//         excludeFields.forEach((field) => delete filters[field]);

//         const queries = {};
//         if (req.query.sort) {
//             queries.sortBy = req.query.sort;
//         }
//         if (req.query.fields) {
//             queries.fields = req.query.fields.split(",").join(" ");
//         }
//         if (req.query.limit) {
//             queries.limit = Number(req.query.limit) || 5;
//         }

//         // Pagination parameters
//         const page = Number(req.query.page) || 1;
//         const limit = queries.limit || 5;
//         const skip = (page - 1) * limit;

//         queries.skip = skip;
//         queries.limit = limit;
//         queries.page = page;

//         // Search logic
//         if (req.query.search) {
//             const searchQuery = req.query.search;
//             filters.$or = [
//                 { university: { $regex: new RegExp(".*" + searchQuery + ".*", "i") } },
//                 { location: { $regex: new RegExp(".*" + searchQuery + ".*", "i") } },
//                 { course: { $regex: new RegExp(".*" + searchQuery + ".*", "i") } },
//             ];
//         }

//         // Fetch filtered data with pagination
//         const { result, totalSchools, pageCount, page: currentPage } = await getFilteredSchools(filters, queries);

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
//             next(createError(500, "No schools found with the provided search or filter criteria"));
//         }
//     } catch (error) {
//         next(createError(500, error.message));
//     }
// };









// THIS CODE COULD HAVE BOTH PAGINATION AND ACCURATE SEARCH AND FILTER 

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
        const filters = { ...req.query };

        // Exclude these fields from filters
        const excludeFields = ["sort", "page", "limit", "fields", "search", "minTuition", "maxTuition", "scholarship"];
        excludeFields.forEach((field) => delete filters[field]);

        const queries = {};

        // Sorting functionality
        if (req.query.sort) {
            queries.sortBy = req.query.sort;
        }

        // Select specific fields
        if (req.query.fields) {
            queries.fields = req.query.fields.split(",").join(" ");
        }

        // Pagination parameters
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        queries.skip = skip;
        queries.limit = limit;
        queries.page = page;

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

        // Fetch the filtered and sorted data from the database
        const { result, totalSchools, pageCount, page: currentPage } = await getFilteredSchools(filters, queries);

        // Response
        if (result.length !== 0) {
            res.status(200).json({
                status: true,
                result,
                totalSchools,
                currentPage,
                pageCount,
            });
        } else {
            next(createError(500, "No schools found with the provided search or filter criteria"));
        }
    } catch (error) {
        next(createError(500, error.message));
    }
};
