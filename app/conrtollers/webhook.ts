/**
 * LINE webhookコントローラ
 */

import * as createDebug from 'debug';
import * as querystring from 'querystring';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-linebot:controller:webhook');

/**
 * メッセージが送信されたことを示すEvent Objectです。
 */
export async function message(event: any) {
    const message: string = event.message.text;
    const MID = event.source.userId;

    switch (true) {
        // ファーストアクション
        case /^予約$/.test(message):
            await pushDate(MID);
            break;
        case /^チケット予約$/.test(message):
            await pushDate(MID);
            break;
        case /^チケット$/.test(message):
            await pushDate(MID);
            break;
        case /^のっぽん$/.test(message):
            await pushFirstChoice(MID);
            break;
        case /^のっぽん！$/.test(message):
            await pushFirstChoice(MID);
            break;
        case /^ヘルプ$/.test(message):
            await pushFirstChoice(MID);
            break;
        // 質問
        case /^質問$/.test(message):
            await pushMessage(MID, '何か聞きたいのかな？？');
            break;
        case /^のっぽんに質問$/.test(message):
            await pushMessage(MID, '何か聞きたいのかな？？');
            break;
        case /^クーポン$/.test(message):
            await pushCoupon(MID);
            break;
        // 日付の選択後
        case /^今日$/.test(message):
            await pushMessage(MID, '今日だね！');
            await pushMessage(MID, '何枚欲しい？');
            await pushNumber(MID);
            break;
        case /^明日$/.test(message):
            await pushMessage(MID, '明日だね！');
            await pushMessage(MID, '何枚欲しい？');
            await pushNumber(MID);
            break;
        case /^その他$/.test(message):
            await pushMessage(MID, 'じゃあいつにする？？');
            break;
        // 日付への返答
        case /^\d{8}$/.test(message):
            await pushPerformances(MID, message);
            break;

        // 日付(YYYY/MM/DD)
        case /^\d{4}\/\d{2}\/\d{2}$/.test(message):
            // tslint:disable-next-line:no-magic-numbers
            await pushPerformances(MID, `${message.substr(0, 4)}${message.substr(5, 2)}${message.substr(8, 2)}`);
            break;
        default:
            // QnA Maker 呼び出し
            /*const generateNextWordsResult = await request.post({
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

            debug(generateNextWordsResult);
            const candidates: any[] = generateNextWordsResult.candidates;
            if (candidates.length > 0) {
                reply = candidates[0].word;
            }

            await pushMessage(MID, reply);*/
            // Translate API
            const translatorTextResult = await getTranslatorText(message);
            // QnA Maker API Call
            const qnaResult = await getQnAText(translatorTextResult);
            let qnAReturn = JSON.parse(qnaResult).answer;
            debug('answer：', qnAReturn);
            if (qnAReturn === 'No good match found in the KB') {
                qnAReturn = 'ちょっと分からない内容だなぁ。。ホームページ見てみて！https://www.tokyotower.co.jp/index.html';
            }
            await pushMessage(MID, qnAReturn);
            break;
    }
}

/**
 * イベントの送信元が、template messageに付加されたポストバックアクションを実行したことを示すevent objectです。
 */
export async function postback(event: any) {
    const data = querystring.parse(event.postback.data);
    debug('data is', data);
    const MID = event.source.userId;

    // 枚数選択
    switch (data.action) {
        case 'selectNumber':
            await pushMessage(MID, 'おっけい！探してくるね～');
            await pushPerformances(MID, '20171030');
            await pushMessage(MID, '作品を選んだら決済画面に遷移するよ～');

            break;

        default:
            break;
    }
}

/**
 * イベント送信元に友だち追加（またはブロック解除）されたことを示すEvent Objectです。
 */
export async function follow(event: any) {
    debug('event is', event);

    return;
}

/**
 * イベント送信元にブロックされたことを示すevent objectです。
 */
export async function unfollow(event: any) {
    debug('event is', event);

    return;
}

/**
 * イベントの送信元グループまたはトークルームに参加したことを示すevent objectです。
 */
export async function join(event: any) {
    debug('event is', event);

    return;
}

/**
 * イベントの送信元グループから退出させられたことを示すevent objectです。
 */
export async function leave(event: any) {
    debug('event is', event);

    return;
}

/**
 * イベント送信元のユーザがLINE Beaconデバイスの受信圏内に出入りしたことなどを表すイベントです。
 */
export async function beacon(event: any) {
    debug('event is', event);

    return;
}

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
    }).promise();
}

/**
 * Azure Translator API呼び出し
 *
 */
async function getTranslatorText(text: string) {
    // Azure Translator Get Token
    const transelatorTokenResult = await request.post({
        simple: false,
        url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': '44219c7bb60743d4a380fc45ea78a66f',
            'Content-Type': 'application/json'
        },
        json: true
    }).promise();

    // Azure Translator Executing Transfer
    debug('getTranslatorText text：', text);
    const getTranslatorResult = await request.get({
        simple: false,
        url: 'https://api.microsofttranslator.com/v2/http.svc/Translate?appid=Bearer ' +
        transelatorTokenResult + '&text=' + encodeURIComponent(text) + '&from=ja&to=en'
    }).promise();
    debug('getTranslatorText getTranslatorResult：', getTranslatorResult.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ''));

    return getTranslatorResult.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
}

/**
 * QnA Maker API呼び出し
 *
 */
async function getQnAText(text: string) {
    // getQnAText
    const getQnATextResult = await request.post({
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
    }).promise();
    debug('getQnATextResult：' + JSON.stringify(getQnATextResult));

    return JSON.stringify(getQnATextResult);
}

/**
 * 日程候補送信
 *
 * @param {string} MID
 */
async function pushFirstChoice(MID: string) {
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
    }).promise();
}

/**
 * 日程候補送信
 *
 * @param {string} MID
 */
async function pushDate(MID: string) {
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
    }).promise();
}

/**
 * 枚数選択送信
 *
 * @param {string} MID
 */
async function pushNumber(MID: string) {
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
    }).promise();
}

/**
 * クーポン送信
 *
 * @param {string} MID
 */
async function pushCoupon(MID: string) {
    // pushCoupon
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
    }).promise();
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
        url: `${process.env.MP_API_ENDPOINT}/ja/performance/search`,
        json: true,
        qs: {
            day: day
        }
    }).promise();
    debug('searchPerformancesResponse:', searchPerformancesResponse);

    const MAX_COLUMNS = 3;
    const performances: any[] =
        searchPerformancesResponse.data.slice(0, Math.min(MAX_COLUMNS, searchPerformancesResponse.data.length));

    if (performances.length === 0) {
        await pushMessage(MID, 'その日はチケット売ってないな～。他の日を入力してみて！！');

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
                productName: performance.attributes.film_name,
                productImageUrl: performance.attributes.film_image,
                amount: amount,
                currency: 'JPY',
                // mid: MID, // 含めるとpaymentUrl先でエラーになるかも？
                confirmUrl: `${process.env.LINE_PAY_WEBHOOK_ENDPOINT}/linepay/confirm?mid=${MID}&amount=${amount}`,
                // confirmUrlType: 'CLIENT',
                confirmUrlType: 'SERVER',
                cancelUrl: '',
                orderId: 'LINEPayOrder_' + Date.now().toString(),
                payType: 'NORMAL', // 一般決済
                langCd: 'ja', // 決済待ち画面(paymentUrl)言語コード。6 種の言語に対応。
                capture: false // 売上処理
            }
        }).promise();
        debug('startLinePayResponse:', startLinePayResponse);

        if (startLinePayResponse.returnCode !== '0000') {

            return;
        }

        columns.push({
            thumbnailImageUrl: performance.attributes.film_image,
            title: performance.attributes.film_name.substr(0, MAX_TITLE_LENGTH),
            text: performance.attributes.theater_name,
            actions: [
                {
                    type: 'uri',
                    label: 'チケット購入',
                    uri: startLinePayResponse.info.paymentUrl.web
                },
                {
                    type: 'uri',
                    label: '作品詳細',
                    uri: 'https://www.google.co.jp/?#q=' + encodeURIComponent(performance.attributes.film_name)
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
    }).promise();
}
