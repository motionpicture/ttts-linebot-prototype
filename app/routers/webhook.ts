/**
 * ルーター
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as HTTPStatus from 'http-status';

import * as webhookController from '../conrtollers/webhook';

const webhookRouter = express.Router();
const debug = createDebug('sskts-linebot:*');

// tslint:disable-next-line:max-func-body-length
webhookRouter.all('/', async (req, res) => {
    debug('body:', JSON.stringify(req.body));

    try {
        const event: any = (Array.isArray(req.body.events)) ? req.body.events[0] : undefined;

        if (event !== undefined) {
            switch (event.type) {
                case 'message':
                    await webhookController.message(event);
                    break;

                case 'postback':
                    await webhookController.postback(event);
                    break;

                case 'follow':
                    await webhookController.follow(event);
                    break;

                case 'unfollow':
                    await webhookController.unfollow(event);
                    break;

                case 'join':
                    await webhookController.join(event);
                    break;

                case 'leave':
                    await webhookController.leave(event);
                    break;

                case 'beacon':
                    await webhookController.postback(event);
                    break;

                default:
                    break;
            }
        }
    } catch (error) {
        console.error(error);
    }

    res.status(HTTPStatus.OK).send('ok');
});

export default webhookRouter;
