"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ルーター
 *
 * @ignore
 */
const createDebug = require("debug");
const express = require("express");
const fs = require("fs-extra");
const request = require("request-promise-native");
const linepayRouter = express.Router();
const debug = createDebug('ttts-linebot-prototype:*');
linepayRouter.all('/confirm', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let reply = '';
    debug(req.query);
    try {
        const confirmLinePayResponse = yield request.post({
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
        }
        else {
            reply = `決済を完了できませんでした${confirmLinePayResponse.returnMessage}`;
        }
        reply += '\n\n日時：2017/3/4(土)\n枚数：2枚\n作品：アメリカから来たモーリス';
        // push message
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
        yield request.post({
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
    }
    catch (error) {
        console.error(error);
    }
    res.send(reply);
}));
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
exports.default = linepayRouter;
