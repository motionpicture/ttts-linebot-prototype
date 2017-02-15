"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const request = require("request-promise-native");
const router = express.Router();
router.get('/environmentVariables', (req, res) => {
    console.log('ip:', req.ip);
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
function pushMessage(MID, text) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post({
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
    });
}
function pushPerformances(MID, day) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchPerformancesResponse = yield request.get({
            url: 'https://devtttsapiprototype.azurewebsites.net/ja/performance/search',
            qs: {
                day: day
            }
        });
        const MAX_COLUMNS = 3;
        const performances = searchPerformancesResponse.results.slice(0, Math.min(MAX_COLUMNS - 1, searchPerformancesResponse.results.length - 1));
        const columns = performances.map((performance) => __awaiter(this, void 0, void 0, function* () {
            const startLinePayResponse = yield request.post({
                url: 'https://sandbox-api-pay.line.me/v2/payments/request',
                headers: {
                    'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
                    'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
                },
                json: {
                    productName: performance.film_name,
                    amount: 1500,
                    currency: 'JPY',
                    confirmUrl: 'https://devssktslinebot.azurewebsites.net/linepay/confirm?mid=' + MID,
                    confirmUrlType: 'SERVER',
                    cancelUrl: '',
                    orderId: 'LINEPayOrder_' + Date.now(),
                    payType: 'NORMAL',
                    langCd: 'ja',
                    capture: false
                }
            });
            console.log(startLinePayResponse.info.paymentUrl);
            if (startLinePayResponse.returnCode !== '0000')
                return false;
            return {
                thumbnailImageUrl: performance.film_image,
                title: performance.film_name,
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
                        uri: 'https://www.google.co.jp/#q=' + performance.film_name
                    }
                ]
            };
        }));
        console.log(columns);
        yield request.post({
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
    });
}
router.all('/webhook', (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log('body:', JSON.stringify(req.body));
    let reply = '...(´д≡; )';
    try {
        const event = (req.body.events) ? req.body.events[0] : undefined;
        if (event) {
            const MID = event.source.userId;
            switch (event.type) {
                case 'message':
                    const message = event.message.text;
                    switch (message) {
                        case '予約':
                            pushMessage(MID, 'いつ？');
                            break;
                        case /[0-9]{6}/:
                            pushPerformances(MID, message);
                            break;
                        default:
                            const generateNextWordsResult = yield request.post({
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
                            const candidates = generateNextWordsResult.candidates;
                            if (candidates.length > 0) {
                                reply = candidates[0].word;
                            }
                            pushMessage(MID, reply);
                            break;
                    }
                    break;
                case 'postback':
                    pushMessage(MID, event.postback.data);
                    break;
                default:
                    break;
            }
        }
    }
    catch (error) {
        console.error(error);
    }
    res.send(reply);
}));
router.all('/linepay/confirm', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let reply = '';
    console.log(req.query);
    try {
        const confirmLinePayResponse = yield request.post({
            url: 'https://sandbox-api-pay.line.me/v2/payments/' + req.query.transactionId + '/confirm',
            headers: {
                'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
                'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
            },
            json: {
                amount: 1,
                currency: 'JPY'
            }
        });
        if (confirmLinePayResponse.returnCode === '0000') {
            reply = '決済完了！' + JSON.stringify(req.query);
        }
        else {
            reply = '決済を完了できませんでした' + confirmLinePayResponse.returnMessage;
        }
        yield request.post({
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
                    }
                ]
            }
        });
    }
    catch (error) {
        console.error(error);
    }
    res.send(reply);
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
