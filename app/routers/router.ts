// tslint:disable:missing-jsdoc no-console
import * as express from 'express';
import * as request from 'request-promise-native';
const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.get('/environmentVariables', (req, res) => {
    console.log('ip:', req.ip);
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});

router.all('/webhook', async (req, res) => {
    console.log('body:', JSON.stringify(req.body));

    let reply = '...(´д≡; )';

    try {
        const event: any = (req.body.events) ? req.body.events[0] : undefined;

        if (event && event.type === 'message') {
            const message = event.message.text;
            const MID = event.source.userId;

            switch (message) {
                case '予約':
                    // LINE Pay開始
                    const response = await request.post({
                        url: 'https://sandbox-api-pay.line.me/v2/payments/request',
                        headers: {
                            'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
                            'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
                        },
                        // json: true,
                        json: {
                            productName: '商品名',
                            amount: 1,
                            currency: 'JPY',
                            // mid: '',
                            confirmUrl: 'https://' + (<any>req.headers).host + '/linepay/confirm',
                            // confirmUrlType: 'CLIENT',
                            confirmUrlType: 'SERVER',
                            cancelUrl: '',
                            orderId: 'LINEPayOrder_' + Date.now(),
                            payType: 'NORMAL', // 一般決済
                            langCd: 'ja', // 決済待ち画面(paymentUrl)言語コード。6 種の言語に対応。
                            capture: false // 売上処理
                        }
                    });

                    console.log(response.info.paymentUrl);
                    if (response.returnCode === '0000') {
                        reply = response.info.paymentUrl.app;
                    }

                    break;

                default:
                    // cognitiveで次のテキスト候補検索
                    const generateNextWordsResult = await request.post({
                        simple: false,
                        url: 'https://westus.api.cognitive.microsoft.com/text/weblm/v1.0/generateNextWords',
                        headers: {
                            'Ocp-Apim-Subscription-Key': 'ecdeb8bb4a5f481ab42e2ff2b765c962'
                        },
                        json: true,
                        qs: {
                            model: 'query',
                            words: message
                        },
                        useQuerystring: true
                    });

                    console.log(generateNextWordsResult);
                    const candidates: any[] = generateNextWordsResult.candidates;
                    if (candidates.length > 0) {
                        reply = candidates[0].word;
                    }

                    break;
            }

            // push message
            await request.post({
                simple: false,
                url: 'https://api.line.me/v2/bot/message/push',
                auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
                json: true,
                body: {
                    to: MID,
                    messages: [
                        {
                            type: 'text',
                            text: reply
                        }
                    ]
                }
            });
        }
    } catch (error) {
        console.error(error);
    }

    res.send(reply);
});

export default router;
