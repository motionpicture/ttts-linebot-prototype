"use strict";
const express = require("express");
const bodyParser = require("body-parser");
let app = express();
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/../../public"));
const router_1 = require("./routers/router");
app.use("/", router_1.default);
app.use((req, res) => {
    res.status(404);
    res.json({
        errors: [
            {
                code: `NotFound`,
                description: `router for [${req.originalUrl}] not found.`
            }
        ]
    });
});
app.use((err, req, res, next) => {
    console.error(req.originalUrl, req.query, req.params, req.body, err);
    if (res.headersSent)
        return next(err);
    res.status(400);
    res.json({
        errors: [
            {
                code: `${err.name}`,
                description: `${err.message}`
            }
        ]
    });
});
module.exports = app;
