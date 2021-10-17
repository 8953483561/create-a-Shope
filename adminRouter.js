const adminrouter = require("express").Router();
const adminController = require("../../Controller/adminController");
const auth = require('../../middleWare/auth')
/********************MULTER********/
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

{
/**
 * @swagger
 * /api/v1/admin/adminLogin:
 *   post:
 *     tags:
 *       - ADMIN
 *     description: ADMIN Login And Provide the access of Token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *       - name: password
 *         description: password
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.post('/adminLogin', adminController.adminLogin);
}
{
/**
 * @swagger
 * /api/v1/admin/userList:
 *   get:
 *     tags:
 *       - ADMIN
 *     description: Admin will see all the register user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.get("/userList", adminController.userList);
}
{
/**
 * @swagger
 * /api/v1/admin/viewuser/{_id}:
 *   get:
 *     tags:
 *       - ADMIN
 *     description: Detail Of a User 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token of Admin
 *         in: header
 *         required: true
 *       - name: _id
 *         description: Id Of user 
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.get('/viewUser/:_id', auth.adminVerify,adminController.viewUser);
}
/**
 * @swagger
 * /api/v1/admin/otpVerify:
 *   put:
 *     tags:
 *       - ADMIN
 *     description: Otp verification
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email/MobileNumber
 *         in: formdata
 *         required: true
 *       - name: otp
 *         description: One Time Password
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.put('/otpVerify', adminController.otpVerify);
/**
 * @swagger
 * /api/v1/admin/resendOtp:
 *   put:
 *     tags:
 *       - ADMIN
 *     description: Resend Otp To Mail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: Registered email / Mobile Number
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.put('/resendOtp', adminController.resendOtp);
/**
 * @swagger
 * /api/v1/admin/forgotPassword:
 *   put:
 *     tags:
 *       - ADMIN
 *     description: Resend Otp To Mail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: Registered email
 *         in: formData
 *         required: true
 *       - name: mobileNumber
 *         description: Registered Mobile Number
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.put('/forgotPassword',adminController.forgotPassword);
/**
 * @swagger
 * /api/v1/admin/resetPassword:
 *   put:
 *     tags:
 *       - ADMIN
 *     description: Resend Otp To Mail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: Registered email
 *         in: formData
 *         required: true
 *       - name: mobileNumber
 *         description: Registered Mobile Number
 *         in: formData
 *         required: false
 *       - name: newPassword
 *         description: New Password
 *         in: formData
 *         required: true
 *       - name: conformPassword
 *         description: ConForm Password
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.put('/resetPassword', adminController.resetPassword);
/**
 * @swagger
 * /api/v1/admin/resetPassword:
 *   put:
 *     tags:
 *       - ADMIN
 *     description: Resend Otp To Mail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Token
 *         description: Admin Token
 *         in: header
 *         required: true
 *       - name: mobileNumber
 *         description: Registered Mobile Number
 *         in: formData
 *         required: false
 *       - name: newPassword
 *         description: New Password
 *         in: formData
 *         required: true
 *       - name: conformPassword
 *         description: ConForm Password
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.put('/updateAdmin', auth.adminVerify,adminController.updateAdmin);
/**
 * @swagger
 * /api/v1/admin/getProfile:
 *   get:
 *     tags:
 *       - ADMIN
 *     description: Detail Of a User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token of Admin
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
*/
adminrouter.get('/getProfile', auth.adminVerify,adminController.getProfile);

/******************Shop Management *************************/
adminrouter.post('/addShop', auth.adminVerify, upload.array('images', 12), adminController.addShop);
adminrouter.get('/viewShop', auth.adminVerify, adminController.viewShop);
adminrouter.get('/listShop', auth.adminVerify, adminController.listShop);
adminrouter.get('/lookupShop', adminController.lookupShop);
adminrouter.get("/lookupCondition", adminController.lookupCondition);
adminrouter.put('/updateShop', auth.adminVerify, adminController.updateShop);
adminrouter.put('/activeorblock', auth.adminVerify, adminController.activeorblock);
adminrouter.put('/deleteShop', auth.adminVerify, adminController.deleteShop);
adminrouter.get('/getprofileWithqrcode', adminController.getprofileWithqrcode);
adminrouter.get('/priceCondition',adminController.priceCondition)

/*******************Category Management *************************************/
adminrouter.post('/addcategory', auth.adminVerify, upload.array('images', 12), adminController.addcategory);
adminrouter.get('/viewCategory', auth.adminVerify, adminController.viewCategory);
adminrouter.get('/listCategory', auth.adminVerify, adminController.listCategory);
adminrouter.put('/updateCategory', auth.adminVerify, adminController.updateCategory);
adminrouter.put('/activeorblockCategory', auth.adminVerify, adminController.activeorblockCategory);
adminrouter.put('/deleteCategory', auth.adminVerify, adminController.deleteCategory);
adminrouter.get('/getcategoryWithqrcode', adminController.getcategoryWithqrcode);

/*******************Product Management *************************************/
adminrouter.post('/addProduct', auth.adminVerify, upload.array('images', 12), adminController.addProduct);
adminrouter.get('/viewProduct', auth.adminVerify, adminController.viewProduct);
adminrouter.get('/listProduct', auth.adminVerify, adminController.listProduct);

adminrouter.put('/updateProduct', auth.adminVerify,  adminController.updateProduct);
adminrouter.put('/activeorblockProduct', auth.adminVerify, adminController.activeorblockProduct);
adminrouter.get('/getproductWithqrcode', adminController.getproductWithqrcode);

adminrouter.get('/lookupProduct', adminController.lookupProduct);


module.exports = adminrouter;