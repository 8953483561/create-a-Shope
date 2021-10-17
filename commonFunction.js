var nodemailer = require("nodemailer");
var cloudinary = require('cloudinary');
const { promises } = require("stream");
const { resolve } = require("path");
cloudinary.config({
    cloud_name: '',
    api_key: '',
    api_secret: ''
})

module.exports = {
    getOtp: () => {
        const otp = Math.ceil((Math.random() * 100000) + 100000);
        return otp;
    },
    sendMail: (email, subject, text, callback) => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '',
                pass: ""
            }
        });
        var mailOptions = {
            from: '',
            to: email,
            subject: subject,
            text: text
        };
        transporter.sendMail(mailOptions, (error, result) => {
            if (error) {
                console.log(error);
                callback(error, null);
            } else {
                console.log('Email Send' + result.response);
                callback(null, result);
            }
        })

    },
    uploadImg: async (image) => {
        let upload = await cloudinary.v2.uploader.upload(image)
        if (upload) {
            return upload.secure_url;
        }
    },
    uploadImgcloud: async (images) => {
        let upload = await cloudinary.v2.uploader.upload(images)
        if (upload) {
            return upload.secure_url;
        }
    },
    uploadImg1: (image, callback) => {
        cloudinary.v2.uploader.upload(image, (error, result) => {
            if (error) {
                callback(null, error)
            } else {
                callback(null, result.secure_url);
            }
        })
    },
    uploadImage(image) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(image, function (error, result) {
                console.log(result);
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.url)
                }
            });
        })
    },
}