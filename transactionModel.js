const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema;
const transactionModel = new schema({

    exp_month: {
        type: Number
    },
    exp_year: {
        type: Number
    },
    cvc: {
        type: Number
    },
    UserId: {
        type: String
    },
    bookingId: {
        type: String
    },
    productId: {
        type: String
    },
    transactionStatus: {
        type: String,
        enum: ["SUCCESSFUL", "PENDING"],
        default: "PENDING"
    },
    quantity: {
        type: String
    },
    price: {
        type: String
    },
    totalCost: {
        type: Number
    }
})
transactionModel.plugin(mongoosePaginate);
module.exports = mongoose.model("transaction", transactionModel);