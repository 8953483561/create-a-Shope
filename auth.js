const jwt = require('jsonwebtoken');
const userModel = require("../Model/userModel");
module.exports = {
    userVerify: (req, res, next) => {
        jwt.verify(req.headers.token, 'user', (tokenErr, decoded) => {
            if (tokenErr) {
                return res.send({ responseCode: 500, responseMessage: "Internal Server Error", responseResult: tokenErr });
            } else {
                userModel.findOne({ _id: decoded._id }, (error, result) => {
                    if (error) {
                        return res.send({ responseCode: 500, responseMessage: "Internal server Error" });
                    } else if (!result) {
                        return res.send({ responseCode: 404, responseMessage: "Data Not Found!" });
                    } else if (result.status == "DELETE") {
                        return res.send({ responseCode: 500, responseMessage: "Your UserID Is Deleted! \n Please Contact To ADMIN" });
                    } else if (result.status == "BLOCK") {
                        return res.send({ responseCode: 500, responseMessage: "Your UserID Is Blocked! \n Please Contact To ADMIN" });
                    } else {
                        req.userId = result._id;
                        next();
                    }
                })
            }
        })
    },
    adminVerify: (req, res, next) => {
        jwt.verify(req.headers.token, 'Admin', (tokenErr, decoded) => {
            if (tokenErr) {
                console.log(tokenErr);
                return res.send({ responseCode: 500, responseMessage: "Internal Server Error", responseResult: tokenErr });
            } else {
                userModel.findOne({ _id: decoded._id }, (error, result) => {
                    if (error) {
                        return res.send({ responseCode: 500, responseMessage: "Internal server Error" });
                    } else if (!result) {
                        return res.send({ responseCode: 404, responseMessage: "Data Not Found!" });
                    } else if (result.status == "DELETE") {
                        return res.send({ responseCode: 500, responseMessage: "Your AdminID Is Deleted!" });
                    } else if (result.status == "BLOCK") {
                        return res.send({ responseCode: 500, responseMessage: "Your AsdminID Is Blocked!" });
                    } else {
                        req.adminId = result._id;
                        next();
                    }
                })
            }
        })
    },
}