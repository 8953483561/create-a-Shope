const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcryptjs = require("bcryptjs")
const paginate = require('mongoose-paginate');

const userkey = new Schema(
    {
        email: {
            type: String
        },
        password: {
            type: String
        },
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        userName: {
            type: String
        },
        DateOfBirth: {
            type: String
        },
        mobileNumber: {
            type: String
        },
        counrtyCode: {
            type: String
        },
        Address: {
            type: String
        },
        otp: {
            type: Number
        },
        image: {
            type: String
        },
        otpTime: {
            type: Number
        },
        token: {
            type: String
        },
        userId:{
            type:String
        },
        otpVerify: {
            type: Boolean,
            default: false
        },
        emailVerify: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
        userType: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER"
        },
    },

    {
        timestamps: true
    }
);
userkey.plugin(paginate)
module.exports = mongoose.model('user', userkey)
/***************ADMIN CREATION*******************/

mongoose.model('user', userkey).findOne({ userType: "ADMIN" }, (error, result) => {
    if (error) {
        console.log(error);
        console.log("Admin Not Found");
    } else if (result) {
        console.log("Admin Already Exists");
    } else {
        var obj = {
            userType: "ADMIN",
            firstName: "Ashutosh Kumar",
            lastName: "Anshu",
            email: "ashutoshanshu@gmail.com",
            mobileNumber: 9876543210,
            counrtyCode: "+91",
            userName: "Admin85799",
            password: bcryptjs.hashSync('Ashutosh'),
            Address: "Noida",
            DateOfBirth: "11/09/1999",
            otpVerify: true,
            emailVerify: true,
        }
        mongoose.model('user', userkey)(obj).save((saveErr, saveRes) => {
            if (saveErr) {
                console.log("ADMIN save Error", saveErr)
            } else {
                console.log("ADMIN Created Successfully", saveRes)
            }
        })
    }

});