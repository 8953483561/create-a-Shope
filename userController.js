const userModel = require('../Model/userModel');
const productModel = require('../Model/productModel');
const cartModel = require('../Model/cartModel');
const bcryptjs = require('bcryptjs');
const commonFunction = require('../helper/commonFunction');
const jwt = require('jsonwebtoken');
const transactionModel = require('../Model/transactionModel');
const cardModel = require('../Model/cardModel');
Publishable_key: "pk_test_51JdC5RSGM0WGaXc3FP4jMad15xBuNGvjZZQ9R1fwHgs9aCx12IFSNIhvkVN7tlSDsqCxu0NsGxqKlK5aFqqZj4Em0088ZMHUqi";
Secret_key: "sk_test_51JdC5RSGM0WGaXc3WGJwMyd9mvXrZp086Ish8Yg5GEegKReznPpgSDsFF5ZN9zihulZ6s57xHxaKC7yeIbAdpul700IjYxZBdi";
const stripe = require('stripe')("sk_test_51JdC5RSGM0WGaXc3WGJwMyd9mvXrZp086Ish8Yg5GEegKReznPpgSDsFF5ZN9zihulZ6s57xHxaKC7yeIbAdpul700IjYxZBdi")


module.exports = {
    /******************************user Management ****************************************/

    signUp: (req, res) => {
        try {
            const query =
            {
                $and: [{
                    $or: [
                        { email: req.body.email },
                        { userName: req.body.userName },
                        { mobileNumber: req.body.mobileNumber }
                    ]
                },
                { status: { $ne: "DELETE" } }
                ]
            }
            var mobileNumber = req.body.mobileNumber;
            var fourDigit = mobileNumber.substr(5, 10);
            req.body.userName = `${req.body.firstName}${fourDigit}`;
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                } else if (result) {
                    if (req.body.email == result.email) {
                        return res.send({ responseCode: 409, responseMessage: "Email Already Exist" });
                    } else if (req.body.userName = result.userName) {
                        return res.send({ responseCode: 409, responseMessage: "UserName Already Exist" });
                    } else if (req.body.mobileNumber == result.mobileNumber) {
                        return res.send({ responseCode: 409, responseMessage: "MobileNumber Already Exist" });
                    }
                } else {
                    req.body.otp = commonFunction.getOtp();
                    req.body.otpTime = new Date().getTime();
                    req.body.password = bcryptjs.hashSync(req.body.password);
                    console.log(req.body.password);
                    new userModel(req.body).save((saveErr, saveRes) => {
                        if (saveErr) {
                            console.log(saveErr)
                            return res.send({ responseCode: 500, responseMessage: "Internal server error", responseResult: saveErr });
                        } else {
                            var emailLink = `http://localhost:3000/user/emailVerify/${saveRes._id}`
                            text = `OTP ${req.body.otp}  http://localhost:3000/user/emailVerify/${saveRes._id}`;
                            subject = "Signup OTP";
                            commonFunction.sendMail(saveRes.email, subject, text, (emailErr, emailRes) => {
                                if (emailErr) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "Successfully signUp", responseResult: saveRes });
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 404, responseMessage: "Went to Catch Block", responseResult: [] })
        }
    },
    otpVerify: (req, res) => {
        try {
            const query =
            {
                $and: [{
                    $or: [
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
    emailVerify: (req, res) => {
        try {
            userModel.findOne({ _id: req.params._id }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "User Not Exist" });
                } else if (result.emailVerify == true) {
                    return res.send({ responseCode: 409, responseMessage: "Email already verify" });
                } else {
                    userModel.findByIdAndUpdate({ _id: result._id }, { $set: { emailVerify: true } }, { new: true }, (updateErr, updateRes) => {
                        if (updateErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal Server Error" })
                        } else {
                            return res.send({ responseCode: 200, responseMessage: "Email Verify Successfuly" })
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Went To Catch Block", responseResult: error });
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
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otp: req.body.otp, otpTime: req.body.otpTime, otpVerify: false } }, { new: true }, (updateErr, updateRes) => {
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
                    { status: { $ne: "DELETE" } }
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
    login: (req, res) => {
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
                { status: { $in: "ACTIVE" } }
                ]
        }
        userModel.findOne(query, (error, result) => {
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "Internal Server error" })
            } else if (!result) {
                return res.send({ responseCode: 404, responseMessage: "Data Not found" })
            } else
                if (result.otpVerify == true) {
                    if (result.emailVerify == true) {
                        let token = jwt.sign({ _id: result._id, email: result.email, mobileNumber: result.mobileNumber }, "user", { expiresIn: '12h' });
                        let data = { token: token }
                        let passcheck = bcryptjs.compareSync(req.body.password, result.password)
                        if (passcheck == false) {
                            return res.send({ responseCode: 401, responseMessage: "Email or password not found!" })
                        } else {
                            return res.send({ responseCode: 200, responseMessage: "Login Successfuly", responseResult: data, result })
                        }
                    } else {
                        return res.send({ responseCode: 401, responseMessage: "First Go and EmailVerify" })
                    }
                } else {
                    return res.send({ responseCode: 401, responseMessage: "First Go and VerifyOTP" })
                }
        });
    },
    editProfile: (req, res) => {
        userModel.findOne({ _id: req.userId }, (error, result) => {
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "1 Internal Server Error!", responseResult: error });
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
    },
    viewUser: (req, res) => {
        try {
            userModel.findOne({ _id: req.userId }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
                } else {
                    return res.send({ responseCode: 200, responseMessage: "View User Successfully", responseResult: result })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 404, responseMessage: "Went to catch Block", responseResult: error })
        }
    },

    /******************************Cart Management ****************************************/

    listProduct: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.userId, userType: "USER" });
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
    addtoCart: (req, res) => {
        try {
            userModel.findOne({ _id: req.userId, status: "ACTIVE", userType: "USER" }, (tokenErr, tokenRes) => {
                if (tokenErr) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                } else if (!tokenRes) {
                    return res.send({ responseCode: 404, responseMessage: "User not exist" })
                } else {
                    productModel.findOne({ _id: req.body.productId }, (productErr, productRes) => {
                        if (productErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                        } else if (!productRes) {
                            return res.send({ responseCode: 404, responseMessage: "Product not found" })
                        } else {
                            cartModel.findOne({ productId: productRes._id, userId: tokenRes._id, }, (error, result) => {
                                if (error) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                                } else if (result) {
                                    return res.send({ responseCode: 200, responseMessage: "Product already exist in your cart", responseResult: [] })
                                } else {
                                    req.body.userId = tokenRes._id;
                                    new cartModel(req.body).save((SaveErr, SaveResult) => {
                                        if (SaveErr) {
                                            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                                        }
                                        else {
                                            return res.send({ responseCode: 200, responseMessage: "Product added to cart added Sucessfully", responseResult: SaveResult })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong" })
        }
    },
    removeFromCart: async (req, res) => {
        try {
            let model = await userModel.findOne({ _id: req.userId, status: "ACTIVE" });
            if (!model) {
                return res.send({ responseCode: 501, responseMessage: "JWT Token Error" })
            } else {
                let updateRes = await cartModel.findByIdAndUpdate({ _id: req.body._id }, { $set: { status: "DELETE" } }, { new: true });
                if (updateRes) {
                    return res.send({ responseCode: 200, responseMessage: "cart Status Deleted Successfully" })
                } else {
                    return res.send({ responseCode: 404, responseMessage: "Data Not found", responseResult: [] })
                }
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Went to catch Block" })
        }
    },
    cartList: (req, res) => {
        try {
            var option = {
                limit: parseInt(req.body.limit) || 10,
                page: parseInt(req.body.page) || 1,
                sort: { createdAt: -1 },
                populate: { path: "productId" }
            }
            cartModel.paginate({ _id: req.body._id }, option, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error." })
                } else if (result.docs.length == 0) {
                    console.log(result);
                    return res.send({ responseCode: 404, responseMessage: "Data not Found" })
                } else {
                    return res.send({ responseCode: 200, responseMessage: "Result succefully Fetch", responseMessage: result })
                }
            })
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something went wrong" })
        }
    },

    /********************************* Transaction Management *****************************************/
    Payment: async (req, res) => {
        try {
            var result = await cartModel.findOne({ _id: req.body._id })
            //console.log(result);
            if (!result == null) {
                res.send({ responseCode: 404, responseMessage: "data Not found" });
            }
            else if (result.transactionStatus == "PAID") {
                res.send({ responseCode: 409, responseMessage: " already paid" });
            }
            else {
                var query1 = {};
                query1.card = { number: req.body.number, exp_month: req.body.exp_month, exp_year: req.body.exp_year, cvc: req.body.cvc }
                var token = await stripe.tokens.create(query1);
                var query = { userName: req.body.userName, description: req.body.description }
                var customer = await stripe.customers.create(query);
                var query2 = { amount: result.quantity * 100, description: req.body.description, currency: 'inr', source: token.id }
                var charge = await stripe.charges.create(query2)
                console.log(result._id);
                var updateRes = await cartModel.findByIdAndUpdate({ _id: result._id }, { $set: { transactionStatus: "PAID", UserId: req.body.id, number: req.body.number, exp_month: req.body.exp_month, exp_year: req.body.exp_year, cvc: req.body.cvc } });
                //console.log(updateRes);
                res.send({ responseCode: 200, responseMessage: "payment sucessful complete", responseResult: charge, customer });
            }
        }
        catch (error) {
            console.log(error);
            res.send({ responseCode: 501, responseMessage: "something went wrong", responseResult: [] });
        }
    },
    booking: (req, res) => {
        try {
            cartModel.findOne({ _id: req.body.productId }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "user not Found" })
                } else {
                    const totalCost = result.cost * req.body.quantity;
                    if (req.body.quantity > 1) {
                        req.body.price = totalCost;
                        cartModel.findOneAndUpdate({ _id: req.body._id }, { $set: { quantity: req.body.quantity, cost: req.body.cost } }, { new: true }, (updateError, updateResult) => {
                            if (updateError) {
                                return res.send({ responseCode: 500, responseMessage: "Internal server error", responseResult: updateError })
                            }
                            else {
                                return res.send({ responseCode: 200, responseMessage: "booking successfully", responseResult: updateResult })
                            }
                        })
                    }
                    else {
                        return res.send({ responseCode: 501, responseMessage: "Invailed Quantity" })
                    }
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong" })
        }
    },
    // refund: async (req, res) => {
    //     try {

    //     } catch (error) {
    //         console.log(error);
    //         return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
    //     }
    // },
    customerCreate: async (req, res) => {
        try {
            var query = { description: req.body.description, email: req.body.email }
            var customer = await stripe.customers.create(query);
            if (customer) {
                return res.send({ responseCode: 200, responseMessage: "Customer created sucessfully", responseResult: customer })
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went wrong", responseResult: [] })
        }
    },
    customerlist: async (req, res) => {
        try {
            var customers = await stripe.customers.list({});
            if (customers) {
                return res.send({ responseCode: 200, responseMessage: "Customer Listed Successfully", responseMessage: customers })
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }

    },
    updateCustomer: async (req, res) => {
        try {
            // const customer = await stripe.customers.update('cus_8epDebVEl8Bs2V',{ metadata: { order_id: '6735' } });
            const customer = await stripe.customers.update(JSON.stringify([{ id: req.body.id }]));
            //const customer = await stripe.customers.update('cus_KIsNj6twE5rES0');
            console.log("-------->553---", customer);
            if (customer) {
                return res.send({ responseCode: 200, responseMessage: "Customer Listed Successfully", responseMessage: customer })
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }

    },
    deleteCustomer: async (req, res) => {
        try {
            const deleted = await stripe.customers.del(
                'cus_KIsNj6twE5rES0'
            );
            if (deleted) {
                return res.send({ responseCode: 200, responseMessage: "Cutomer Deleted Successfully" })
            }
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }
    },
    retrieveCustomer: async (req, res) => {
        try {
            const customer = await stripe.customers.retrieve(
                req.body.id
            );
            return res.send({ responseCode: 200, responseMessage: "Retrieve Customer Successfully", responseResult: customer })
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }

    },
    transactionList: async (req, res) => {
        try {
            const balanceTransactions = await stripe.balanceTransactions.list({
                // limit: 3,
            });
            return res.send({ responseCode: 200, responseMessage: "Transaction List Successfully", responseResult: balanceTransactions })
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }
    },
    retrieveBalance: async (req, res) => {
        try {
            stripe.balance.retrieve((req.body.id), function (err, balance) {
                // asynchronously called
            });
            //console.log(balance);
            return res.send({ responseCode: 200, responseMessage: "Balance Successfully"})
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }
    },
    createCard:async(req,res) =>{
        try {
            const card = await stripe.customers.createSource(
            req.body.id,
            { source: 'tok_mastercard' }
        );
        if (card) {
            //console.log(card);
            var object = {
                cardId: card.id,
                exp_month: card.exp_month,
                exp_year: card.exp_year,
                customerId: card.customer
            }
            var saveRes = await new cardModel(object).save()
            if (saveRes) {
                return res.send({ responseCode: 200, responseMessage: "Card Added Successfully", responseResult: saveRes })
            }
        }
        
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }
        
    },
    /********* Same As **********/
    retriveveCard:async(req,res) => {
        try {
            const card = await stripe.customers.retrieve(
                req.body.id
            );
            return res.send({ responseCode: 200, responseMessage: "Retriveve Card Successfully",responseResult:card})
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }
    },
    UpdateCard:async(req,res) => {
        try {
            const card = await stripe.customers.updateSource(
                'cus_KIsNj6twE5rES0',
                'card_1Jea54SGM0WGaXc3x8MufHB7',
                { name: 'Ashutosh Kumar Anshu' }
            );
            return res.send({responseCode:200,responseMessage:"Updated Successfully",responseResult:card})
        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responseMessage: "Something Went Wrong", responseResult: [] })
        }
    },
    




}