const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/m2test', { useNewUrlParser: true, useUnifiedTopology: true }, (error, result) => {
    if (error) {
        console.log('Not Connected!#');
    } else {
        console.log("Connected Successfully!..");
    }
});