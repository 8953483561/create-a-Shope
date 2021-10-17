const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paginate = require('mongoose-paginate');

const categorykey = new Schema(
    {
        categoryId: {
            type: String
        },
        CategoryName: {
            type: String
        },
        image: {
            type: Array
        },
        description:{
            type:String
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
    },
    {
        timestamps: true
    }
)
categorykey.plugin(paginate)
module.exports = mongoose.model('category', categorykey)