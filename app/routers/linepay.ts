/**
 * ルーター
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as request from 'request-promise-native';
const linepayRouter = express.Router();
const debug = createDebug('ttts-linebot-prototype:*');

linepayRouter.all('/confirm', async (req, res) => {
    let reply = '';
    debug(req.query);

    try {
        const confirmLinePayResponse = await request.post({
            url: `https://sandbox-api-pay.line.me/v2/payments/${req.query.transactionId}/confirm`,
            headers: {
                'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
                'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
            },
            json: {
                amount: req.query.amount,
                currency: 'JPY'
            }
        }).promise();

        if (confirmLinePayResponse.returnCode === '0000') {
            reply = '上映当日はこのQRコードをタップすると入場できるよ！';
        } else {
            reply = `決済を完了できませんでした${confirmLinePayResponse.returnMessage}`;
        }
        reply += '\n\n日時：2017/3/4(土)\n枚数：2枚\n作品：アメリカから来たモーリス';
        // push message
        await request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: req.query.mid,
                messages: [
                    {
                        type: 'text',
                        text: reply
                    },
                    {
                        type: 'imagemap',
                        baseUrl: `${process.env.LINE_PAY_WEBHOOK_ENDPOINT}/linepay/qrcode`,
                        altText: 'qrcode',
                        baseSize: {
                            height: 1040,
                            width: 1040
                        },
                        actions: [
                            {
                                type: 'message',
                                text: 'QRコードの使い方',
                                area: {
                                    x: 520,
                                    y: 0,
                                    width: 520,
                                    height: 1040
                                }
                            }
                        ]
                    }
                ]
            }
        }).promise();

        await request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: req.query.mid,
                messages: [
                    {
                        type: 'template',
                        altText: '↓↓のボタンから作品の概要を調べてみよう！',
                        template: {
                            type: 'buttons',
                            thumbnailImageUrl: 'https://devchevrefrontend.azurewebsites.net/images/film/000127.jpg',
                            text: '↓↓のボタンから作品の概要を調べてみよう！',
                            actions: [
                                {
                                    type: 'uri',
                                    label: 'Webサイトに遷移',
                                    uri: `https://www.google.co.jp/?#q=${encodeURIComponent('アメリカから来たモーリス')}`
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    } catch (error) {
        console.error(error);
    }

    res.send(reply);
});

// tslint:disable-next-line:variable-name
linepayRouter.get('/qrcode/:width', (__, res, next) => {
    fs.readFile(`${__dirname}/../../public/images/qrcode.png`, (err, data) => {
        if (err instanceof Error) {
            next(err);

            return;
        }
        res.contentType('image/png');
        res.send(data);
    });
});

export default linepayRouter;
