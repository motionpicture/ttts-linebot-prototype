"use strict";
// tslint:disable:missing-jsdoc no-backbone-get-set-outside-model
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
// The extended option allows to choose between parsing the URL-encoded data
// with the querystring library (when false) or the qs library (when true).
app.use(bodyParser.urlencoded({ extended: true }));
// 静的ファイル
app.use(express.static(`${__dirname}/../public`));
// routers
const linepay_1 = require("./routers/linepay");
const router_1 = require("./routers/router");
const webhook_1 = require("./routers/webhook");
app.use('/', router_1.default);
app.use('/webhook', webhook_1.default);
app.use('/linepay', linepay_1.default);
// 404
app.use((req, res) => {
    const STATUS_CODE_NOT_FOUND = 404;
    res.status(STATUS_CODE_NOT_FOUND);
    res.json({
        errors: [
            {
                code: 'NotFound',
                description: `router for [${req.originalUrl}] not found.`
            }
        ]
    });
});
// error handlers
app.use((err, req, res, next) => {
    console.error(req.originalUrl, req.query, req.params, req.body, err);
    if (res.headersSent) {
        next(err);
        return;
    }
    const STATUS_CODE_BAD_REQUET = 400;
    res.status(STATUS_CODE_BAD_REQUET);
    res.json({
        errors: [
            {
                code: err.name,
                description: err.message
            }
        ]
    });
});
module.exports = app;
