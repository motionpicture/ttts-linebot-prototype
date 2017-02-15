// tslint:disable:missing-jsdoc no-backbone-get-set-outside-model
import * as bodyParser from 'body-parser';
import * as express from 'express';

const app = express();

// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.use(bodyParser.json());
// The extended option allows to choose between parsing the URL-encoded data
// with the querystring library (when false) or the qs library (when true).
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイル
app.use(express.static(__dirname + '/../../public'));

// routers
import router from './routers/router';
app.use('/', router);

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(req.originalUrl, req.query, req.params, req.body, err);
    if (res.headersSent) return next(err);

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

export = app;
