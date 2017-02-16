// tslint:disable:missing-jsdoc no-console
import * as express from 'express';
import * as fs from 'fs-extra';
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

/**
 * メッセージ送信
 *
 * @param {string} MID
 * @param {string} text
 */
async function pushMessage(MID: string, text: string) {
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
                    text: text
                }
            ]
        }
    });
}

/**
 * パフォーマンスリスト送信
 *
 * @param {string} MID
 * @param {string} day
 */
async function pushPerformances(MID: string, day: string) {
    // パフォーマンス検索
    const searchPerformancesResponse = await request.get({
        url: 'https://devtttsapiprototype.azurewebsites.net/ja/performance/search',
        json: true,
        qs: {
            day: day
        }
    });

    const MAX_COLUMNS = 3;
    const performances: any[] =
        searchPerformancesResponse.results.slice(0, Math.min(MAX_COLUMNS, searchPerformancesResponse.results.length));

    if (performances.length === 0) {
        await pushMessage(MID, 'なんもやってない');
        return;
    }

    const columns: any[] = [];
    const MAX_TITLE_LENGTH = 30;
    const promises = performances.map(async (performance) => {
        const amount = 1500;
        // LINE Pay開始
        const startLinePayResponse = await request.post({
            url: 'https://sandbox-api-pay.line.me/v2/payments/request',
            headers: {
                'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
                'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
            },
            json: {
                productName: performance.film_name,
                productImageUrl: performance.film_image,
                amount: amount,
                currency: 'JPY',
                // mid: MID, // 含めるとpaymentUrl先でエラーになるかも？
                confirmUrl: 'https://devssktslinebot.azurewebsites.net/linepay/confirm?mid=' + MID + '&amount=' + amount,
                // confirmUrlType: 'CLIENT',
                confirmUrlType: 'SERVER',
                cancelUrl: '',
                orderId: 'LINEPayOrder_' + Date.now(),
                payType: 'NORMAL', // 一般決済
                langCd: 'ja', // 決済待ち画面(paymentUrl)言語コード。6 種の言語に対応。
                capture: false // 売上処理
            }
        });

        if (startLinePayResponse.returnCode !== '0000') return;

        columns.push({
            thumbnailImageUrl: performance.film_image,
            title: performance.film_name.substr(0, MAX_TITLE_LENGTH),
            text: performance.theater_name,
            actions: [
                {
                    type: 'uri',
                    label: '座席予約',
                    uri: startLinePayResponse.info.paymentUrl.web
                },
                {
                    type: 'uri',
                    label: '作品詳細',
                    uri: 'https://www.google.co.jp/?#q=' + encodeURIComponent(performance.film_name)
                }
            ]
        });
    });

    await Promise.all(promises);

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
                    type: 'template',
                    altText: 'パフォーマンスリスト',
                    template: {
                        type: 'carousel',
                        columns: columns
                    }
                }
            ]
        }
    });
}

router.all('/webhook', async (req, res) => {
    console.log('body:', JSON.stringify(req.body));

    let reply = '...(´д≡; )';

    try {
        const event: any = (req.body.events) ? req.body.events[0] : undefined;

        if (event) {
            const MID = event.source.userId;

            switch (event.type) {
                case 'message':
                    const message: string = event.message.text;

                    switch (true) {
                        case /^予約$/.test(message):
                            await pushMessage(MID, 'いつ？');
                            break;

                        // 日付への返答
                        case /^\d{8}$/.test(message):
                            await pushPerformances(MID, message);
                            break;

                        // 日付(YYYY/MM/DD)
                        case /^\d{4}\/\d{2}\/\d{2}$/.test(message):
                            await pushPerformances(MID, `${message.substr(0, 4)}${message.substr(4, 2)}${message.substr(6, 2)}`);
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

                            await pushMessage(MID, reply);
                            break;
                    }

                    break;

                case 'postback':
                    await pushMessage(MID, event.postback.data);

                    break;

                default:
                    break;
            }
        }
    } catch (error) {
        console.error(error);
    }

    res.send(reply);
});

router.all('/linepay/confirm', async (req, res) => {
    let reply = '';
    console.log(req.query);

    try {
        const confirmLinePayResponse = await request.post({
            url: 'https://sandbox-api-pay.line.me/v2/payments/' + req.query.transactionId + '/confirm',
            headers: {
                'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
                'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
            },
            json: {
                amount: req.query.amount,
                currency: 'JPY'
            }
        });

        if (confirmLinePayResponse.returnCode === '0000') {
            reply = '上映当日はこのQRコードをタップすると入場できるよ！';
        } else {
            reply = '決済を完了できませんでした' + confirmLinePayResponse.returnMessage;
        }

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
                        baseUrl: 'https://devssktslinebot.azurewebsites.net/linepay/qrcode',
                        altText: 'qrcode',
                        baseSize: {
                            height: 1040,
                            width: 1040
                        },
                        actions: [
                            {
                                type: 'message',
                                text: '入場？？',
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
        });
    } catch (error) {
        console.error(error);
    }

    res.send(reply);
});


// tslint:disable-next-line:variable-name
router.get('/linepay/qrcode/:width', (_req, res, next) => {
    fs.readFile(__dirname + '/../../public/images/qrcode.png', (err, data) => {
        if (err) return next(err);
        res.contentType('image/png');
        res.send(data);
    });
});

export default router;
