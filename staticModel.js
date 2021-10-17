const mongoose = require("mongoose");
const schema = mongoose.Schema;

const statickey = new schema(
    {
        type: {
            type: String
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
    },
    {
        timestamps: true
    }
)
module.exports = mongoose.model('static', statickey);

mongoose.model('static', statickey).findOne({}, (staticErr, staticRes) => {
    if (staticErr) {
        console.log(staticErr)
    } else if (staticRes) {
        console.log('static data already created');
    } else {
        var object1 = {
            type: "About Us",
            title: "About Us",
            description: "You Can write about the Company or about the app"
        };
        var object2 = {
            type: "Contact",
            title: "Contact",
            description: "You can simply share you contact or also create a form so that we will contact him after some time"
        };
        var object3 = {
            type: "Careers",
            title: "Careers",
            description: "You can simply share the jobs and the achievements also"
        };
        mongoose.model('static', statickey).create(object1, object2, object3, (createErr, createRes) => {
            if (createErr) {
                console.log("Static Creation Error", createErr)
            } else {
                console.log("Static Created Successfully", createRes)
            }
        })
    }
})
