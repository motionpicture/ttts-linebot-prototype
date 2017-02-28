"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const createDebug = require("debug");
const express = require("express");
const fs = require("fs-extra");
const request = require("request-promise-native");
const router = express.Router();
const debug = createDebug('sskts-linebot:*');
router.all('/confirm', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let reply = '';
    debug(req.query);
    try {
        const confirmLinePayResponse = yield request.post({
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
        }
        else {
            debug('confirmLinePayResponse.returnCode：' + confirmLinePayResponse.returnCode);
            debug('confirmLinePayResponse.returnMessage' + confirmLinePayResponse.returnMessage);
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
                    },
                    {
                        type: 'imagemap',
                        baseUrl: process.env.LINE_PAY_WEBHOOK_ENDPOINT + '/linepay/qrcode',
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
    }
    catch (error) {
        console.error(error);
    }
    res.send(reply);
}));
router.get('/qrcode/:width', (_req, res, next) => {
    fs.readFile(__dirname + '/../../public/images/qrcode.png', (err, data) => {
        if (err)
            return next(err);
        res.contentType('image/png');
        res.send(data);
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
