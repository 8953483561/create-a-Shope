const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paginate = require('mongoose-paginate');
const aggregatePaginate = require('mongoose-aggregate-paginate')

const shopkey = new Schema(
    {
        shopId: {
            type: String
        },
        ShopName: {
            type: String
        },
        counrtyCode: {
            type: String
        },
        mobileNumber: {
            type: String
        },
        email: {
            type: String
        },
        Address: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        image: {
            type: Array
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
        categoryId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'category'
        },
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product'
        }

    },
    {
        timestamps: true
    }
)
shopkey.plugin(paginate)
shopkey.plugin(aggregatePaginate)
module.exports = mongoose.model('shop', shopkey)