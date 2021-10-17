const staticModel = require("../model/staticModel");

module.exports = {
    staticList: (req, res) => {
        try {
            staticModel.find({ status: { $in: ["ACTIVE", "BLOCK"] } }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error!", responseResult: error });
                } else if (result.length == 0) {
                    return res.send({ responseCode: 404, responseResult: "Static Data Not Exist" });
                } else {
                    return res.send({ responseCode: 200, responseResult: "Static Data listed Successfully!", responseResult: result });
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Went To catch Block", responseResult: error })
        }
    },
    viewStatic: (req, res) => {
        try {
            console.log(req.params);
            staticModel.findOne({ _id: req.body._id, status: "ACTIVE" }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal Server Error" });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Static Data Not Found" })
                } else {
                    return res.send({ responseCode: 200, responseMessage: "Static Data are Found Successfully", responseResult: result });
                }
            })
        } catch (error) {
            console.log(error)
            return req.send({ responseCode: 501, responseMessage: "Went To catch Block", responseResult: error });
        }
    },
    editStatic: (req, res) => {
        staticModel.findOne({ _id: req.body._id }, (error, result) => {
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "1 Internal Server Error!", responseResult: error });
            } else if (!result) {
                return res.send({ responseCode: 404, responseMessage: "Data Not Found" });
            } else {
                if (result.email == req.body.email) {
                    staticModel.findByIdAndUpdate({ _id: result._id }, { $set: (req.body) }, { new: true }, (updateErr, updateRes) => {
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

}