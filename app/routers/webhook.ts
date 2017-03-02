/**
 * ルーター
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as HTTPStatus from 'http-status';

import * as webhookController from '../conrtollers/webhook';

const router = express.Router();
const debug = createDebug('sskts-linebot:*');

// tslint:disable-next-line:max-func-body-length
router.all('/', async (req, res) => {
    debug('body:', JSON.stringify(req.body));

    try {
        const event: any = (req.body.events) ? req.body.events[0] : undefined;

        if (event) {
            switch (event.type) {
                case 'message':
                    webhookController.message(event);
                    break;

                case 'postback':
                    webhookController.postback(event);
                    break;

                default:
                    break;
            }
        }
    } catch (error) {
        console.error(error);
    }

    res.status(HTTPStatus.NO_CONTENT).end();
});

export default router;
