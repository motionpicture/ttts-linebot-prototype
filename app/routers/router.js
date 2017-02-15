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
router.all('/webhook', (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log('body:', JSON.stringify(req.body));
    let reply = '...(´д≡; )';
    try {
        const event = (req.body.events) ? req.body.events[0] : undefined;
        if (event && event.type === 'message') {
            const message = event.message.text;
            const MID = event.source.userId;
            switch (message) {
                case '予約':
                    const response = yield request.post({
                        url: 'https://sandbox-api-pay.line.me/v2/payments/request',
                        headers: {
                            'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
                            'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
                        },
                        json: {
                            productName: '商品名',
                            amount: 1,
                            currency: 'JPY',
                            mid: MID,
                            confirmUrl: 'https://' + req.headers.host + '/linepay/confirm?mid=' + MID,
                            confirmUrlType: 'SERVER',
                            cancelUrl: '',
                            orderId: 'LINEPayOrder_' + Date.now(),
                            payType: 'NORMAL',
                            langCd: 'ja',
                            capture: false
                        }
                    });
                    console.log(response.info.paymentUrl);
                    if (response.returnCode === '0000') {
                        reply = response.info.paymentUrl.web;
                    }
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
                    break;
            }
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
                            text: reply
                        }
                    ]
                }
            });
        }
    }
    catch (error) {
        console.error(error);
    }
    res.send(reply);
}));
router.all('/linepay/confirm', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let reply = '';
    try {
        const confirmLinePayResponse = yield request.post({
            url: 'https://sandbox-api-pay.line.me/v2/payments/${req.query.transactionId}/confirm',
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
