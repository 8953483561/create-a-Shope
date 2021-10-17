const express = require("express");
const app = express();
const port = 3000;
const db = require('./Database/dbConnection');
// const router = require('./Router/userRouter');
//const staticrouter = require('./Router/staticRouter');
const admin = require('./Routers/adminRouter/adminRouter')
const index = require('./Routers/index')
const user = require('./Routers/userRouter')
/***************Swagger Require*******************/
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(express.urlencoded({ extended: true, limit: "1000mb" }));
app.use(express.json({ limit: "1000mb" }));
app.use("/api/v1",index);
// app.use("/api/v1",router);

const swaggerDefinition = {
    info: {
        title: "M2Test",
        version: "1.0.0",
        description: "Test Of Swagger",
    },
    host: "localhost:3000",
    basePath: "/"
};
var options = {
    swaggerDefinition: swaggerDefinition,
    apis: ["./Routers/*/*.js"],
};
var swaggerSpec = swaggerJsdoc(options);

app.get("/swagger.json", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/***************** End Of Swagger *******************/

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.use('/api/v1')
// app.use('/user', router);
// app.use('/static', staticrouter);
app.use('/admin', admin);
app.use('/user', user);
// app.get('/ra', function (req, res) {
//     res.send('hello world')
// })

app.listen(port, (Error, Result) => {
    if (Error) {
        console.log('Server Is Not Coonected');
    } else {
        console.log(`Server Is Running at ${port}`);
    }
})