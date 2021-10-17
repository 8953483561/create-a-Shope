const staticrouter = require("express").Router();
const staticController = require("../controller/staticController");

staticrouter.get("/staticList", staticController.staticList);
staticrouter.get('/viewStatic', staticController.viewStatic);
staticrouter.put("/editStatic", staticController.editStatic);

module.exports = staticrouter;