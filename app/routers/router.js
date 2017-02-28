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
router.get('/environmentVariables', (req, res) => {
    debug('ip:', req.ip);
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
function getTranslatorText(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const transelatorTokenResult = yield request.post({
            simple: false,
            url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
            headers: {
                'Ocp-Apim-Subscription-Key': '44219c7bb60743d4a380fc45ea78a66f',
                'Content-Type': 'application/json'
            },
            json: true
        });
        debug('getTranslatorText text：' + text);
        const getTranslatorResult = yield request.get({
            simple: false,
            url: 'https://api.microsofttranslator.com/v2/http.svc/Translate?appid=Bearer ' +
                transelatorTokenResult + '&text=' + encodeURIComponent(text) + '&from=ja&to=en'
        });
        debug('getTranslatorText getTranslatorResult：' + getTranslatorResult.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ''));
        return getTranslatorResult.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
    });
}
function getQnAText(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const getQnATextResult = yield request.post({
            simple: false,
            url: 'https://westus.api.cognitive.microsoft.com/qnamaker/v1.0/knowledgebases/8564d98a-7bf6-4a1d-9e02-6bca84592264/generateAnswer',
            headers: {
                'Ocp-Apim-Subscription-Key': '01d8e8acf75b4ec0babed7f0e3ad644c',
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                question: text
            }
        });
        debug('getQnATextResult：' + JSON.stringify(getQnATextResult));
        return JSON.stringify(getQnATextResult);
    });
}
function pushFirstChoice(MID) {
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
                        type: 'template',
                        altText: 'こんにちは！どうしたの～？',
                        template: {
                            type: 'confirm',
                            thumbnailImageUrl: 'https://www.tokyotower.co.jp/event/files/_MG_4371.JPG',
                            text: 'こんにちは！どうしたの～？',
                            actions: [
                                {
                                    type: 'message',
                                    label: 'チケット予約',
                                    text: 'チケット予約'
                                },
                                {
                                    type: 'message',
                                    label: '質問',
                                    text: '質問'
                                }
                            ]
                        }
                    }
                ]
            }
        });
    });
}
function pushDate(MID) {
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
                        type: 'template',
                        altText: 'いつにする(代替)？？',
                        template: {
                            type: 'buttons',
                            thumbnailImageUrl: 'https://www.tokyotower.co.jp/event/files/_MG_4371.JPG',
                            text: '承ったぜ。いつにする？？',
                            actions: [
                                {
                                    type: 'message',
                                    label: '今日',
                                    text: '今日'
                                },
                                {
                                    type: 'message',
                                    label: '明日',
                                    text: '明日'
                                },
                                {
                                    type: 'message',
                                    label: 'その他',
                                    text: 'その他'
                                }
                            ]
                        }
                    }
                ]
            }
        });
    });
}
function pushNumber(MID) {
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
                        type: 'template',
                        altText: 'aaa',
                        template: {
                            type: 'buttons',
                            thumbnailImageUrl: 'https://devssktslinebotdemo.blob.core.windows.net/image/tokyo.PNG',
                            text: '4枚まで買えるよ～',
                            actions: [
                                {
                                    type: 'message',
                                    label: '1枚',
                                    text: '1枚'
                                },
                                {
                                    type: 'message',
                                    label: '2枚',
                                    text: '2枚'
                                },
                                {
                                    type: 'message',
                                    label: '3枚',
                                    text: '3枚'
                                },
                                {
                                    type: 'message',
                                    label: '4枚',
                                    text: '4枚'
                                }
                            ]
                        }
                    }
                ]
            }
        });
    });
}
function pushCoupon(MID) {
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
                        type: 'template',
                        altText: 'aaa',
                        template: {
                            type: 'buttons',
                            thumbnailImageUrl: 'https://devssktslinebotdemo.blob.core.windows.net/image/tokyo.PNG',
                            text: '【LINE@友達限定】のっぽんアクセサリーをプレゼント♪',
                            actions: [
                                {
                                    type: 'message',
                                    label: '今すぐ確認',
                                    text: '1枚'
                                }
                            ]
                        }
                    }
                ]
            }
        });
    });
}
function pushPerformances(MID, day) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchPerformancesResponse = yield request.get({
            url: process.env.MP_API_ENDPOINT + '/ja/performance/search',
            json: true,
            qs: {
                day: day
            }
        });
        debug('searchPerformancesResponse.results.length：' + searchPerformancesResponse.results.length);
        const MAX_COLUMNS = 3;
        const performances = searchPerformancesResponse.results.slice(0, Math.min(MAX_COLUMNS, searchPerformancesResponse.results.length));
        if (performances.length === 0) {
            yield pushMessage(MID, 'その日はチケット売ってないな～。他の日を入力してみて！！');
            return;
        }
        const columns = [];
        const MAX_TITLE_LENGTH = 30;
        const promises = performances.map((performance) => __awaiter(this, void 0, void 0, function* () {
            const amount = 1500;
            const startLinePayResponse = yield request.post({
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
                    confirmUrl: 'https://devssktslinebot-demo.azurewebsites.net/linepay/confirm?mid=' + MID + '&amount=' + amount,
                    confirmUrlType: 'SERVER',
                    cancelUrl: '',
                    orderId: 'LINEPayOrder_' + Date.now(),
                    payType: 'NORMAL',
                    langCd: 'ja',
                    capture: false
                }
            });
            if (startLinePayResponse.returnCode !== '0000')
                return;
            debug(startLinePayResponse.returnCode);
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
        }));
        yield Promise.all(promises);
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
    debug('body:', JSON.stringify(req.body));
    let reply = '';
    try {
        const event = (req.body.events) ? req.body.events[0] : undefined;
        if (event) {
            const MID = event.source.userId;
            switch (event.type) {
                case 'message':
                    const message = event.message.text;
                    switch (true) {
                        case /^予約$/.test(message):
                            yield pushDate(MID);
                            break;
                        case /^チケット予約$/.test(message):
                            yield pushDate(MID);
                            break;
                        case /^チケット$/.test(message):
                            yield pushDate(MID);
                            break;
                        case /^のっぽん$/.test(message):
                            yield pushFirstChoice(MID);
                            break;
                        case /^のっぽん！$/.test(message):
                            yield pushFirstChoice(MID);
                            break;
                        case /^ヘルプ$/.test(message):
                            yield pushFirstChoice(MID);
                            break;
                        case /^質問$/.test(message):
                            yield pushMessage(MID, '何か聞きたいのかな？？');
                            break;
                        case /^のっぽんに質問$/.test(message):
                            yield pushMessage(MID, '何か聞きたいのかな？？');
                            break;
                        case /^のっぽんに質問$/.test(message):
                            yield pushMessage(MID, '何か聞きたいのかな？？');
                            break;
                        case /^クーポン$/.test(message):
                            yield pushCoupon(MID);
                            break;
                        case /^今日$/.test(message):
                            yield pushMessage(MID, '今日だね！');
                            yield pushMessage(MID, '何枚欲しい？');
                            yield pushNumber(MID);
                            break;
                        case /^明日$/.test(message):
                            yield pushMessage(MID, '明日だね！');
                            yield pushMessage(MID, '何枚欲しい？');
                            yield pushNumber(MID);
                            break;
                        case /^その他$/.test(message):
                            yield pushMessage(MID, 'じゃあいつにする？？');
                            break;
                        case /^\d{8}$/.test(message):
                            yield pushPerformances(MID, message);
                            break;
                        case /^\d{4}\/\d{2}\/\d{2}$/.test(message):
                            yield pushPerformances(MID, `${message.substr(0, 4)}${message.substr(5, 2)}${message.substr(8, 2)}`);
                            break;
                        case /^1枚$/.test(message):
                            yield pushMessage(MID, 'おっけい！探してくるね～');
                            yield pushPerformances(MID, '20171030');
                            yield pushMessage(MID, '作品を選んだら決済画面に遷移するよ～');
                            break;
                        case /^2枚$/.test(message):
                            yield pushMessage(MID, 'おっけい！探してくるね～');
                            yield pushPerformances(MID, '20171030');
                            yield pushMessage(MID, '作品を選んだら決済画面に遷移するよ～');
                            break;
                        case /^3枚$/.test(message):
                            yield pushMessage(MID, 'おっけい！探してくるね～');
                            yield pushPerformances(MID, '20171030');
                            yield pushMessage(MID, '作品を選んだら決済画面に遷移するよ～');
                            break;
                        case /^4枚$/.test(message):
                            yield pushMessage(MID, 'おっけい！探してくるね～');
                            yield pushPerformances(MID, '20171030');
                            yield pushMessage(MID, '作品を選んだら決済画面に遷移するよ～');
                            break;
                        default:
                            const TranslatorTextResult = yield getTranslatorText(message);
                            const QnAResult = yield getQnAText(TranslatorTextResult);
                            let QnAReturn = JSON.parse(QnAResult)['answer'];
                            debug('answer：' + QnAReturn);
                            QnAReturn = QnAReturn == 'No good match found in the KB' ? 'ちょっと分からない内容だなぁ。。ホームページ見てみて！https://www.tokyotower.co.jp/index.html' : QnAReturn;
                            yield pushMessage(MID, QnAReturn);
                            break;
                    }
                    break;
                case 'postback':
                    yield pushMessage(MID, event.postback.data);
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
                        baseUrl: 'https://devssktslinebot-demo.azurewebsites.net/linepay/qrcode',
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
router.get('/linepay/qrcode/:width', (_req, res, next) => {
    fs.readFile(__dirname + '/../../public/images/qrcode.png', (err, data) => {
        if (err)
            return next(err);
        res.contentType('image/png');
        res.send(data);
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
