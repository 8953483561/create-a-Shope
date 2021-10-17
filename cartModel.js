const mongoose = require('mongoose');
const schema = mongoose.Schema;
const paginate = require('mongoose-paginate');

const cartkey = new schema({

    quantity: {
        type: Number,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    transactionStatus: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING"
    },
    exp_month: {
        type: Number
    },
    exp_year: {
        type: Number
    },
    cvc: {
        type: Number
    },
    bookingId: {
        type: String
    },
    price: {
        type: String
    },
    totalCost: {
        type: Number
    }
},
    {
        timestamps: true
    }
)

cartkey.plugin(paginate);
module.exports = mongoose.model('cart', cartkey);

