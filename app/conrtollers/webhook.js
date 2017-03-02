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
const querystring = require("querystring");
const request = require("request-promise-native");
const debug = createDebug('sskts-linebot:controller:webhook');
function message(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = event.message.text;
        const MID = event.source.userId;
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
            default:
                const translatorTextResult = yield getTranslatorText(message);
                const qnaResult = yield getQnAText(translatorTextResult);
                let qnAReturn = JSON.parse(qnaResult).answer;
                debug('answer：' + qnAReturn);
                if (qnAReturn === 'No good match found in the KB') {
                    qnAReturn = 'ちょっと分からない内容だなぁ。。ホームページ見てみて！https://www.tokyotower.co.jp/index.html';
                }
                yield pushMessage(MID, qnAReturn);
                break;
        }
    });
}
exports.message = message;
function postback(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = querystring.parse(event.postback.data);
        debug('data is', data);
        const MID = event.source.userId;
        switch (data.action) {
            case 'selectNumber':
                yield pushMessage(MID, 'おっけい！探してくるね～');
                yield pushPerformances(MID, '20171030');
                yield pushMessage(MID, '作品を選んだら決済画面に遷移するよ～');
                break;
            default:
                break;
        }
    });
}
exports.postback = postback;
function follow(event) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('event is', event);
        return;
    });
}
exports.follow = follow;
function unfollow(event) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('event is', event);
        return;
    });
}
exports.unfollow = unfollow;
function join(event) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('event is', event);
        return;
    });
}
exports.join = join;
function leave(event) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('event is', event);
        return;
    });
}
exports.leave = leave;
function beacon(event) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('event is', event);
        return;
    });
}
exports.beacon = beacon;
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
                                    type: 'postback',
                                    label: '1枚',
                                    data: 'action=selectNumber&number=1'
                                },
                                {
                                    type: 'postback',
                                    label: '2枚',
                                    data: 'action=selectNumber&number=2'
                                },
                                {
                                    type: 'postback',
                                    label: '3枚',
                                    data: 'action=selectNumber&number=3'
                                },
                                {
                                    type: 'postback',
                                    label: '4枚',
                                    data: 'action=selectNumber&number=4'
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
                    confirmUrl: process.env.LINE_PAY_WEBHOOK_ENDPOINT + '/linepay/confirm?mid=' + MID + '&amount=' + amount,
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
