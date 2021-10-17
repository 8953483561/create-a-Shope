const mongoose = require('mongoose');
const schema = mongoose.Schema;
const paginate = require('mongoose-paginate');

const cardKey = new schema({

    CardId:{
        type:String
    },
    exp_month: {
        type: Number
    },
    exp_year: {
        type: Number
    },
    customerId: {
        type: String
    },
    
},
    {
        timestamps: true
    }
)

cardKey.plugin(paginate);
module.exports = mongoose.model('card', cardKey);

