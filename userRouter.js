const router = require('express').Router();
const { Router } = require('express');
const userController = require('../Controller/userController')
const auth = require('../middleWare/auth')

router.post('/signUp',userController.signUp);
router.put('/otpVerify', userController.otpVerify);
router.put('/resendOtp', userController.resendOtp);
router.get("/emailVerify/:_id", userController.emailVerify);
router.put("/forgotPassword", userController.forgotPassword);
router.put("/resetPassword", userController.resetPassword);
router.post("/login", userController.login)
router.put("/editProfile", auth.userVerify, userController.editProfile)
router.get("/viewUser", auth.userVerify, userController.viewUser);

/*******************Cart Management *************************************/
router.get('/listProduct', auth.userVerify, userController.listProduct);
router.post('/addtocart', auth.userVerify, userController.addtoCart);
router.put('/removeFromCart', auth.userVerify, userController.removeFromCart);
router.get('/cartList',auth.userVerify,userController.cartList)

/******************* Transaction Management *************************************/
router.post('/Payment',userController.Payment);
router.post('/booking', userController.booking);
router.post('/customerCreate',userController.customerCreate);
router.get('/customerlist', userController.customerlist);
router.post('/updateCustomer', userController.updateCustomer);
router.delete('/deleteCustomer',userController.deleteCustomer);
router.get('/retrieveCustomer', userController.retrieveCustomer);
router.get('/transactionList', userController.transactionList);
router.get("/retrieveBalance",userController.retrieveBalance);
router.post('/createCard', userController.createCard);
router.put('/retriveveCard', userController.retriveveCard);
router.put('/UpdateCard', userController.UpdateCard);
module.exports = router