/**
 * Line Payを開始する
 * Line PayにはIP制限があるので注意
 */
import * as createDebug from 'debug';
import * as request from 'request-promise-native';

const debug = createDebug('ttts-linebot-prototype:*');

async function main() {
    const response = await request.post({
        url: 'https://sandbox-api-pay.line.me/v2/payments/request',
        headers: {
            'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
            'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET
        },
        json: {
            productName: '商品名',
            amount: 1,
            currency: 'JPY',
            // confirmUrl: `https://${req.headers["host"]}/linepay/confirm`,
            // tslint:disable-next-line:no-http-string
            confirmUrl: 'http://localhost:8080/linepay/confirm',
            confirmUrlType: 'CLIENT',
            cancelUrl: '',
            orderId: `LINEPayOrder_${Date.now()}`,
            payType: 'NORMAL', // 一般決済
            langCd: 'ja', // 決済待ち画面(paymentUrl)言語コード。6 種の言語に対応。
            capture: false // 売上処理
        }
    }).promise();

    if (response.returnCode !== '0000') throw new Error(response.returnMessage);
    debug(response.info.paymentUrl);
}

// tslint:disable-next-line:no-floating-promises
main().then(() => {
    debug('success!');
}).catch((error) => {
    console.error(error);
});
