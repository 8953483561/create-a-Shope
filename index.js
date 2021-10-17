const router = require("express").Router();
const admin = require('./adminRouter/adminRouter');

router.use('/admin', admin);

module.exports = router;