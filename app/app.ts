import express = require("express");
import bodyParser = require("body-parser");

let app = express();


// view engine setup
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // The extended option allows to choose between parsing the URL-encoded data with the querystring library (when false) or the qs library (when true).

// 静的ファイル
app.use(express.static(__dirname + "/../../public"));



// routers
import router from "./routers/router";
app.use("/", router);

// 404
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

// error handlers
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(req.originalUrl, req.query, req.params, req.body, err);
    if (res.headersSent) return next(err);

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

export = app;
