const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paginate = require('mongoose-paginate');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const productkey = new Schema(
    {
        productId: {
            type: String
        },
        productName: {
            type: String
        },
        image: {
            type: Array
        },
        images: {
            type: String
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        desciption: {
            type: String
        },
        status: {
            type: String,
            enum: ["ACTIVE", "OUT OF STOCK", "BLOCK"],
            default: "ACTIVE"
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "shop"
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category"
        }

    },
    {
        timestamps: true
    }
)
productkey.plugin(paginate)
productkey.plugin(aggregatePaginate)
module.exports = mongoose.model('product', productkey)