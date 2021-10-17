const userModel = require('../Model/userModel');
const shopModel = require('../Model/shopModel');
const bcryptjs = require('bcryptjs');
const commonFunction = require('../helper/commonFunction');
const jwt = require('jsonwebtoken');
const qrCode = require('qrcode');
const productModel = require('../Model/productModel');
const categoryModel = require('../Model/categoryModel');
const cartModel = require('../Model/cartModel');

module.exports = {
    /*********************** ADMIN Management ********************************/
    adminLogin: async (req, res) => {
        try {
            var query = {
                $and: [{
                    $or: [
                        { email: req.body.email },
                        { mobileNumber: req.body.mobileNumber }
                    ]
                },
                {
                    status: { $ne: "DELETE" },
                    userType: "ADMIN"
                }
                ]
            }
            let model = await userModel.findOne(query);
            if (!model) {
                return res.send({ responseCode: 404, responseMessage: "Admin not Exist" })
            } else {
                {
                    let password = bcryptjs.compareSync(req.body.password, model.password)
                    if (password == true) {
                        token = jwt.sign({ _id: model._id }, 'Admin', { expiresIn: '12h' });
                        // console.log(token);
                        return res.send({ responseCode: 200, responseMessage: "Login Successfuly", responseResult: token, model })
                    } else {
                        return res.send({ responseCode: 409, responseMessage: "Email or password not found!" })
                    }
                }
            }

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went To Catch Block" })
        }
    },
    userList: (req, res) => {
        try {
            const query = { status: { $ne: "DELETE" }, userType: { $in: "USER" } }
            let options = {
                limit: parseInt(req.body.limit) || 10,
                page: parseInt(req.body.page) || 1,
                sort: { createAt: -1 }
            };
            userModel.paginate(query, options, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                } else if (result.length == 0) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
                } else {
                    return res.send({ responseCode: 200, responseMessage: "User Listed Successfully", responseResult: result, options });
                }
            })
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block", responseResult: error })
        }
    },
    viewUser: (req, res) => {
        try {
            userModel.findOne({ _id: req.adminId }, { userType: "ADMIN" }, (tokenerror, tokenresult) => {
                if (tokenerror) {
                    return res.send({ responseCode: 401, responseMessage: "JWT Token Error" });
                } else {
                    userModel.findOne({ _id: req.params._id }, (error, result) => {
                        if (error) {
                            console.log(error);
                            return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                        } else if (!result) {
                            return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
                        } else {
                            return res.send({ responseCode: 200, responseMessage: "View User Successfully", responseResult: result })
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    otpVerify: (req, res) => {
        try {
            const query =
            {
                $and: [{
                    $or: [
                        { email: req.body.email },
                        { mobileNumber: req.body.email }
                    ]
                },
                { status: { $ne: "DELETE" } }
                ]
            }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server error" })
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found!.." })
                } else {
                    var currentTime = new Date().getTime();
                    var dbTime = result.otpTime;
                    var diff = currentTime - dbTime;
                    if (diff <= 3 * 60 * 1000) {
                        if (result.otp == req.body.otp) {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otpVerify: true } }, { new: true }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal Server error" })
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "OTP Verified Successfull", responseResult: updateRes.Otp })
                                }
                            })
                        } else {
                            return res.send({ responseCode: 401, responseMessage: "Incorrect Otp" })
                        }
                    } else {
                        return res.send({ responseCode: 408, responseMessage: "Otp Expire" })
                    }
                }
            })

        } catch (error) {
            console.log("catch error", error);
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error })
        }
    },
    resendOtp: (req, res) => {
        try {
            const query =
            {
                $and:
                    [{
                        $or:
                            [
                                { email: req.body.email },
                                { mobileNumber: req.body.mobileNumber }
                            ]
                    },
                    { status: { $ne: "DELETE" } }
                    ]
            }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
                } else {
                    req.body.otp = commonFunction.getOtp();
                    req.body.otpTime = new Date().getTime();
                    text = ` Resend OTP ${req.body.otp}`;
                    subject = "Resend OTP";
                    commonFunction.sendMail(result.email, subject, text, (emailErr, emailRes) => {
                        if (emailErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                        } else {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otp: req.body.otp, otpTime: req.body.otpTime, otpVerify: false } }, { new: true }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "Resend Otp Successfully", responseMessage: updateRes })
                                }
                            })
                        }
                    })
                }

            })
        } catch (error) {
            return res.send({ responseCode: 404, responseMessage: "Data Not Found or something Went Wrong", responseResult: error })
        }
    },
    forgotPassword: (req, res) => {
        try {
            const query =
            {
                $and:
                    [{
                        $or:
                            [
                                { email: req.body.email },
                                { mobileNumber: req.body.mobileNumber }
                            ]
                    },
                    { status: { $ne: "DELETE" } }
                    ]
            }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server error" })
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not found" })
                } else {
                    req.body.otp = commonFunction.getOtp();
                    req.body.otpTime = new Date().getTime();
                    text = `Forgot Password OTP :- ${req.body.otp} \n It will be valid For 3 minutes only`;
                    subject = "Forgot OTP";
                    commonFunction.sendMail(result.email, subject, text, (emailErr, emailRes) => {
                        if (emailErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                        } else {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otp: req.body.otp, otpTime: req.body.otpTime, otpVerify: true } }, { new: true }, (updateErr, updateRes) => {
                                console.log("Data update")
                                if (updateErr) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "Forgot successfully" });
                                }
                            })
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 404, responseMessage: "Went to Catch Block", responseResult: error })
        }
    },
    resetPassword: (req, res) => {
        try {
            const query =
            {
                $and:
                    [{
                        $or:
                            [
                                { email: req.body.email },
                                { mobileNumber: req.body.mobileNumber }
                            ]
                    },
                    { status: { $ne: "DELETE" } },
                    { userType: "ADMIN" }
                    ]
            }
            userModel.findOne(query, (error, result) => {
                console.log(result);
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server error", responseResult: error });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not found" });
                } else {
                    if (result.otpVerify == true) {
                        if (req.body.conformPassword == req.body.newPassword) {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { password: bcryptjs.hashSync(req.body.newPassword), otpVerify: false } }, { new: true }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal Server error" });
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "Reset Password successfully" });
                                }
                            })
                        } else {
                            return res.send({ responseCode: 200, responseMessage: "Conform Password and New Password Not Matched" });
                        }
                    } else {
                        return res.send({ responseCode: 500, responseMessage: "First Verify Your OTP" });
                    }
                }
            })
        } catch (error) {
            return res.send({ responseCode: 404, responseMessage: "Went to Catch Block", responseResult: error })
        }
    },
    updateAdmin: (req, res) => {
        try {

            userModel.findOne({ _id: req.adminId, userType: "ADMIN" }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error!", responseResult: error });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
                } else {
                    if (result.email == req.body.email) {
                        if (req.body.password) {
                            req.body.password = bcryptjs.hashSync(req.body.password);
                        }
                        userModel.findByIdAndUpdate({ _id: result._id }, { $set: (req.body) }, { new: true }, (updateErr, updateRes) => {
                            if (updateErr) {
                                return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                            } else {
                                return res.send({ responseCode: 200, responseMessage: "Edited Successfully", responseResult: updateRes })
                            }
                        })
                    }
                }

            })
        } catch (error) {
            console.log(error);
        }

    },
    getProfile: async (req, res) => {
        try {
            let adminRes = await userModel.findOne({ _id: req.adminId, userType: "ADMIN" })
            if (!adminRes) {
                console.log(adminRes);
                return res.send({ responseCode: 400, responseMessage: "data not found" })
            }
            else {
                userString = adminRes.toString()
                let code = await qrCode.toDataURL(userString);
                if (code) {
                    return res.send({ responseCode: 200, responseMessage: "Details fetched successfuly", responseResult: code });
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went To Catch Block" });
        }
    },
    /*********************** Shop Management ********************************/

    addShop: async (req, res) => {
        try {
            let admin = await userModel.findOne({ _id: req.adminId, userType: "ADMIN" });
            if (!admin) {
                return res.send({ responseCode: 409, responseMessage: "Data not found" })
            } else {
                let shop = await shopModel.findOne({ ShopName: req.body.ShopName });
                if (shop) {
                    return res.send({ responseCode: 409, responseMessage: "ShopName Already exist" })
                } else {
                    let photo = [];
                    for (i = 0; i < req.files.length; i++) {
                        let image = await commonFunction.uploadImg(req.files[i].path)
                        photo.push(image);
                    }
                    req.body.image = photo
                    let saveRes = await new shopModel(req.body).save();
                    if (saveRes) {
                        return res.send({ responseCode: 200, responseMessage: "Shop added successfully", responseResult: saveRes })
                    }

                }
            }
        }
        catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to Catch Block" })
        }
    },
    viewShop: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, userType: "ADMIN" })
            if (!model) {
                return res.send({ responseCode: 409, responseMessage: "Data Not Found" });
            } else {
                var query = { status: "ACTIVE" }
                if (req.body.search) {
                    query.$or = [
                        { Name: { $regex: req.body.search, $options: 'i' } },
                        { city: { $regex: req.body.search, $options: 'i' } },
                    ];
                }
                // } else {
                //     { status: "ACTIVE" }
                // }
                let options = {
                    limit: parseInt() || 10,
                    page: parseInt() || 1,
                    sort: { creatAt: -1 },
                }
                let shop = await shopModel.paginate(query, options)
                if (shop.docs.length == 0) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
                } else {
                    return res.send({ responseCode: 200, responseMessage: "View shop Successfully", responseResult: shop })
                }

            }

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    listShop: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, userType: { $ne: "USER" } })
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "Jwt Token Error", responseResult: [] });
            } else {
                let query = { status: { $ne: "DELETE" } }
                let options = {
                    limit: parseInt(req.body.limit) || 10,
                    page: parseInt(req.body.page) || 1,
                    sort: { createAt: -1 },
                    populate: { path: "productId", select: "productName" }
                };
                let shop = await shopModel.paginate(query, options);
                if (shop) {
                    return res.send({ responseCode: 200, responseMessage: "Shop Listed Successfully", responseResult: shop });
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found", responseResult: [] })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block", responseResult: error })
        }
    },
    lookupShop: async (req, res) => {
        try {
            let aggregate = shopModel.aggregate([
                {
                    $match: { ShopName: req.body.ShopName }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "category"
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: "productId",
                        foreignField: "_id",
                        as: "product"
                    },
                },
            ])
            let options = {
                limit: parseInt(req.body.limit) || 10,
                page: parseInt(req.body.page) || 1,
                sort: { createAt: -1 }
            };
            shopModel.aggregatePaginate(aggregate, options, (error, result, count) => {
                if (error) {
                    console.log(error);
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" })
                } else if (result.length == 0) {
                    return res.send({ responseCode: 404, responseMessage: "Data NOT Found" })
                } else {
                    return res.send({ responseCode: 200, responseMessage: "lookup Applied Successfully", responseResult: result, count })
                }
            })

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    lookupCondition: async (req, res) => {
        try {
            if (req.body.categoryId && req.body.ShopName) {
                let aggregate = shopModel.aggregate([
                    {
                        $match: { ShopName: req.body.ShopName }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: "categoryId",
                            foreignField: "_id",
                            as: "category"
                        },
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "productId",
                            foreignField: "_id",
                            as: "product"
                        },
                    },
                ])
                let options = {
                    limit: parseInt(req.body.limit) || 10,
                    page: parseInt(req.body.page) || 1,
                    sort: { createAt: -1 }
                };
                shopModel.aggregatePaginate(aggregate, options, (error, result, count) => {
                    if (error) {
                        console.log(error);
                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" })
                    } else if (result.length == 0) {
                        return res.send({ responseCode: 404, responseMessage: "Data NOT Found" })
                    } else {
                        return res.send({ responseCode: 200, responseMessage: "shop Listed with category Id Successfully", responseResult: result, count })
                    }
                })

            } else if (!req.body.categoryId && req.body.ShopName) {
                let aggregate = shopModel.aggregate([
                    {
                        $match: { ShopName: req.body.ShopName }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "productId",
                            foreignField: "_id",
                            as: "product"
                        },
                    },
                ])
                let options = {
                    limit: parseInt(req.body.limit) || 10,
                    page: parseInt(req.body.page) || 1,
                    sort: { createAt: -1 }
                };
                shopModel.aggregatePaginate(aggregate, options, (error, result, count) => {
                    if (error) {
                        console.log(error);
                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" })
                    } else if (result.length == 0) {
                        return res.send({ responseCode: 404, responseMessage: "Data NOT Found" })
                    } else {
                        return res.send({ responseCode: 200, responseMessage: "Shop Listed Without CategoryID Successfully", responseResult: result, count })
                    }
                })

            } else {
                let aggregate = shopModel.aggregate([
                    {
                        $match: { status: "ACTIVE" }
                    }
                ])
                let options = {
                    limit: parseInt(req.body.limit) || 10,
                    page: parseInt(req.body.page) || 1,
                    sort: { createAt: -1 }
                };
                shopModel.aggregatePaginate(aggregate, options, (error, result, count) => {
                    if (error) {
                        console.log(error);
                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" })
                    } else if (result.length == 0) {
                        return res.send({ responseCode: 404, responseMessage: "Data NOT Found" })
                    } else {
                        return res.send({ responseCode: 200, responseMessage: "shop Listed Successfully", responseResult: result, count })
                    }
                })

            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went To catch Block" })
        }
    },
    priceCondition: async (req, res) => {
        try {
            let aggregate = shopModel.aggregate([
                {
                    $lookup: {
                        from: "products",
                        let: { bookingId: "$_id" },
                        pipeline: [
                            //{ $match: { productName: { $regex: req.body.search, $options: 'i' } } },
                            { $sort: { price: 1 } }
                        ],
                        as: "productData",
                    },
                }
            ])
            // let options = {
            //     limit: parseInt(req.body.limit) || 10,
            //     page: parseInt(req.body.page) || 1,
            //     sort: { createAt: -1 }
            // };
            var result = await shopModel.aggregatePaginate(aggregate)
            if (result.docs.length == 0) {
                return res.send({ responseCode: 404, responseMessage: "Data NOT Found" })
            } else {
                return res.send({ responseCode: 200, responseMessage: "lookup Applied Successfully", responseResult: result })
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    updateShop: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, status: "ACTIVE" });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "JWT Token Error" });
            } else {
                // req.body.ownerId = tokenresult._id;
                let updateRes = await shopModel.findByIdAndUpdate({ _id: req.body._id }, { $set: (req.body) }, { new: true });
                if (updateRes) {
                    return res.send({ responseCode: 200, responseMessage: "Edited Successfully", responseResult: updateRes })
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found", responseResult: [] })
                }

            }

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    activeorblock: (req, res) => {
        try {
            userModel.findOne({ _id: req.adminId, userType: "ADMIN" }, (tokenerror, tokenresult) => {
                if (tokenerror) {
                    return res.send({ responseCode: 500, responseMessage: "JWT Token Error" })
                } else if (!tokenresult) {
                    console.log();
                    return res.send({ responseCode: 404, responseMessage: "Data Not found" })
                } else {
                    shopModel.findOne({ _id: req.body._id }, (error, result) => {
                        if (error) {
                            return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                        } else {
                            if (result.status == "ACTIVE") {
                                shopModel.findByIdAndUpdate({ _id: result._id }, { $set: { status: "BLOCK" } }, { new: true }, (updateErr, updateRes) => {
                                    if (updateErr) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "Block Successfully", responseResult: updateRes });
                                    }
                                })
                            } else {
                                shopModel.findByIdAndUpdate({ _id: result._id }, { $set: { status: "ACTIVE" } }, { new: true }, (updateErr, updateRes) => {
                                    if (updateErr) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "Active Successfully", responseResult: updateRes });
                                    }
                                })
                            }
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    deleteShop: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, status: "ACTIVE" });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "JWT Token Error" })
            } else {
                let updateRes = await shopModel.findByIdAndUpdate({ _id: req.body._id }, { $set: { status: "DELETE" } }, { new: true });
                if (updateRes) {
                    return res.send({ responseCode: 200, responseMessage: "Shop Status Deleted Successfully" })
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not found", responseResult: [] })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    getprofileWithqrcode: async (req, res) => {
        try {
            let model = await shopModel.findOne({ _id: req.body._id });
            if (!model) {
                return res.send({ responseCode: 404, responseMessage: "Data Not Found" })
            } else {
                userString = model.toString()
                let code = await qrCode.toDataURL(userString);
                if (code) {
                    return res.send({ responseCode: 200, responseMessage: "QR generated Successfully", responseResult: code })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch block", responseResult: error })
        }
    },

    /*******************************Category Manaagement ************************************/

    addcategory: async (req, res) => {
        try {
            let admin = await userModel.findOne({ _id: req.adminId, userType: "ADMIN" });
            if (!admin) {
                return res.send({ responseCode: 409, responseMessage: "Data not found" })
            } else {
                let shop = await categoryModel.findOne({ CategoryName: req.body.CategoryName });
                if (shop) {
                    return res.send({ responseCode: 409, responseMessage: "Category Already exist" })
                } else {
                    let photo = [];
                    for (i = 0; i < req.files.length; i++) {
                        let image = await commonFunction.uploadImg(req.files[i].path)
                        photo.push(image);
                    }
                    req.body.image = photo
                    let saveRes = await new categoryModel(req.body).save();
                    if (saveRes) {
                        return res.send({ responseCode: 200, responseMessage: "Category added successfully", responseResult: saveRes })
                    }

                }
            }
        }
        catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to Catch Block" })
        }
    },
    viewCategory: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, userType: "ADMIN" })
            if (!model) {
                return res.send({ responseCode: 409, responseMessage: "JWT Token Error", responseResult: [] });
            } else {
                var query = { status: "ACTIVE" }
                if (req.body.search) {
                    query.$or = [
                        { CategoryName: { $regex: req.body.search, $options: 'i' } },
                    ];
                }
                let options = {
                    limit: parseInt() || 10,
                    page: parseInt() || 1,
                    sort: { creatAt: -1 },
                }
                let shop = await categoryModel.paginate(query, options)
                if (shop.docs.length == 0) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found", responseResult: [] });
                } else {
                    return res.send({ responseCode: 200, responseMessage: "Category View Successfully", responseResult: shop })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    listCategory: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, userType: { $ne: "USER" } });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "Jwt Token Error", responseResult: [] });
            } else {
                let query = { status: { $ne: "DELETE" } }
                let options = {
                    limit: parseInt(req.body.limit) || 10,
                    page: parseInt(req.body.page) || 1,
                    sort: { createAt: -1 },

                };
                let shop = await categoryModel.paginate(query, options);
                if (shop) {
                    return res.send({ responseCode: 200, responseMessage: "Category Listed Successfully", responseResult: shop });
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found", responseResult: [] })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block", responseResult: error })
        }
    },
    updateCategory: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, status: "ACTIVE" });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "JWT Token Error" });
            } else {
                // req.body.ownerId = tokenresult._id;
                // let photo = [];
                // for (i = 0; i < req.files.length; i++) {
                //     let image = await commonFunction.uploadImg(req.files[i].path)
                //     photo.push(image);
                // }
                // req.body.image = photo
                let updateRes = await categoryModel.findByIdAndUpdate({ _id: req.body._id }, { $set: (req.body) }, { new: true });
                if (updateRes) {
                    return res.send({ responseCode: 200, responseMessage: "Edited Successfully", responseResult: updateRes })
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found", responseResult: [] })
                }

            }

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    activeorblockCategory: (req, res) => {
        try {
            userModel.findOne({ _id: req.adminId, userType: "ADMIN" }, (tokenerror, tokenresult) => {
                if (tokenerror) {
                    return res.send({ responseCode: 500, responseMessage: "JWT Token Error" })
                } else if (!tokenresult) {
                    console.log();
                    return res.send({ responseCode: 404, responseMessage: "Data Not found" })
                } else {
                    categoryModel.findOne({ _id: req.body._id }, (error, result) => {
                        if (error) {
                            return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                        } else {
                            if (result.status == "ACTIVE") {
                                categoryModel.findByIdAndUpdate({ _id: result._id }, { $set: { status: "BLOCK" } }, { new: true }, (updateErr, updateRes) => {
                                    if (updateErr) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "Block Successfully", responseResult: updateRes });
                                    }
                                })
                            } else {
                                categoryModel.findByIdAndUpdate({ _id: result._id }, { $set: { status: "ACTIVE" } }, { new: true }, (updateErr, updateRes) => {
                                    if (updateErr) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "Active Successfully", responseResult: updateRes });
                                    }
                                })
                            }
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    deleteCategory: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, status: "ACTIVE" });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "JWT Token Error" })
            } else {
                let updateRes = await categoryModel.findByIdAndUpdate({ _id: req.body._id }, { $set: { status: "DELETE" } }, { new: true });
                if (updateRes) {
                    return res.send({ responseCode: 200, responseMessage: "category Status Deleted Successfully" })
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not found", responseResult: [] })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    getcategoryWithqrcode: async (req, res) => {
        try {
            let model = await categoryModel.findOne({ _id: req.body._id });
            if (!model) {
                return res.send({ responseCode: 404, responseMessage: "Data Not Found" })
            } else {
                userString = model.toString()
                let code = await qrCode.toDataURL(userString);
                if (code) {
                    return res.send({ responseCode: 200, responseMessage: "QR generated Successfully", responseResult: code })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch block" })
        }
    },

    /******************************Product Management ****************************************/

    addProduct: async (req, res) => {
        try {
            let admin = await userModel.findOne({ _id: req.adminId, userType: "ADMIN" });
            if (!admin) {
                return res.send({ responseCode: 409, responseMessage: "Data not found" })
            } else {
                let product = await productModel.findOne({ productName: req.body.productName });
                if (product) {
                    return res.send({ responseCode: 409, responseMessage: "Product Already exist" })
                } else {
                    let photo = [];
                    for (i = 0; i < req.files.length; i++) {
                        let image = await commonFunction.uploadImg(req.files[i].path)
                        photo.push(image);
                    }
                    req.body.image = photo
                    req.body.productId = admin._id
                    let saveRes = await new productModel(req.body).save();
                    if (saveRes) {
                        return res.send({ responseCode: 200, responseMessage: "Product added successfully", responseResult: saveRes })
                    }

                }
            }
        }
        catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to Catch Block" })
        }
    },
    viewProduct: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, userType: "ADMIN" })
            if (!model) {
                return res.send({ responseCode: 409, responseMessage: "JWT Token Error" });
            } else {
                var query = { status: "AVAILABLE" }
                if (req.body.search) {
                    query.$or = [
                        { productName: { $regex: req.body.search, $options: 'i' } },
                    ];
                }
                let options = {
                    limit: parseInt() || 10,
                    page: parseInt() || 1,
                    sort: { creatAt: -1 },
                }
                let product = await productModel.paginate(query, options)
                if (product.docs.length == 0) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
                } else {
                    return res.send({ responseCode: 200, responseMessage: "product View Successfully", responseResult: product })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    listProduct: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, userType: { $ne: "USER" } });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "Jwt Token Error", responseResult: [] });
            } else {
                let query = { status: { $ne: "DELETE" } }
                let options = {
                    limit: parseInt(req.body.limit) || 10,
                    page: parseInt(req.body.page) || 1,
                    sort: { createAt: -1 }
                };
                let product = await productModel.paginate(query, options);
                if (product) {
                    return res.send({ responseCode: 200, responseMessage: "Product Listed Successfully", responseResult: product });
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found", responseResult: [] })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block", responseResult: error })
        }
    },
    lookupProduct: async (req, res) => {
        try {
            let aggregate = productModel.aggregate([
                {
                    $match: { productName: req.body.productName },
                    $match: { status: "ACTIVE" }
                },
                {
                    $lookup: {
                        from: 'shops',
                        // localField:'shopId',
                        // foreignField:'_id',
                        pipeline: [{
                            $sort: { price: (-1) }
                        }],
                        as: 'Shop'
                    },
                }
            ])
            let options = {
                limit: parseInt(req.body.limit) || 10,
                page: parseInt(req.body.page) || 1,
                sort: { createAt: -1 }
            };
            productModel.aggregatePaginate(aggregate, options, (error, result, count) => {
                if (error) {
                    console.log(error);
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" })
                } else if (result.length == 0) {
                    return res.send({ responseCode: 404, responseMessage: "Data NOT Found" })
                } else {
                    return res.send({ responseCode: 200, responseMessage: "lookup Applied Successfully", responseResult: result, count })
                }
            })

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch block" })
        }
    },
    updateProduct: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.adminId, status: "ACTIVE" });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "JWT Token Error" });
            } else {
                // req.body.ownerId = tokenresult._id;
                
                // let photo = [];
                // for (i = 0; i < req.files.length; i++) {
                //     let image = await commonFunction.uploadImg(req.files[i].path)
                //     photo.push(image);
                // }
                // req.body.image = photo
                
                var upload = await commonFunction.uploadImgcloud(req.body.images)
                
                if (upload) {
                    console.log(upload);
                    req.body.images = upload
                    let updateRes = await productModel.findByIdAndUpdate({ _id: req.body._id }, { $set: (req.body) }, { new: true });
                    if (updateRes) {
                        return res.send({ responseCode: 200, responseMessage: "Edited Successfully", responseResult: updateRes })
                    } else {
                        return res.send({ responseCode: 404, responseMessage: "Data Not Found", responseResult: [] })
                    }
                }
                

            }

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    activeorblockProduct: (req, res) => {
        try {
            userModel.findOne({ _id: req.adminId, userType: "ADMIN" }, (tokenerror, tokenresult) => {
                if (tokenerror) {
                    return res.send({ responseCode: 500, responseMessage: "JWT Token Error" })
                } else if (!tokenresult) {
                    console.log();
                    return res.send({ responseCode: 404, responseMessage: "Data Not found" })
                } else {
                    productModel.findOne({ _id: req.body._id }, (error, result) => {
                        if (error) {
                            return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                        } else {
                            if (result.status == "ACTIVE") {
                                productModel.findByIdAndUpdate({ _id: result._id }, { $set: { status: "BLOCK" } }, { new: true }, (updateErr, updateRes) => {
                                    if (updateErr) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "Block Successfully", responseResult: updateRes });
                                    }
                                })
                            } else {
                                productModel.findByIdAndUpdate({ _id: result._id }, { $set: { status: "ACTIVE" } }, { new: true }, (updateErr, updateRes) => {
                                    if (updateErr) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "ACTIVE Successfully", responseResult: updateRes });
                                    }
                                })
                            }
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    getproductWithqrcode: async (req, res) => {
        try {
            let model = await productModel.findOne({ _id: req.body._id });
            if (!model) {
                return res.send({ responseCode: 404, responseMessage: "Data Not Found" })
            } else {
                userString = model.toString()
                let code = await qrCode.toDataURL(userString);
                if (code) {
                    return res.send({ responseCode: 200, responseMessage: "QR generated Successfully", responseResult: code })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch block" })
        }
    },

}