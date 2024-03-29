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
 * Line Payを開始する
 * Line PayにはIP制限があるので注意
 */
const createDebug = require("debug");
const request = require("request-promise-native");
const debug = createDebug('ttts-linebot-prototype:*');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
                // confirmUrl: `https://${req.headers["host"]}/linepay/confirm`,
                // tslint:disable-next-line:no-http-string
                confirmUrl: 'http://localhost:8080/linepay/confirm',
                confirmUrlType: 'CLIENT',
                cancelUrl: '',
                orderId: `LINEPayOrder_${Date.now()}`,
                payType: 'NORMAL',
                langCd: 'ja',
                capture: false // 売上処理
            }
        }).promise();
        if (response.returnCode !== '0000')
            throw new Error(response.returnMessage);
        debug(response.info.paymentUrl);
    });
}
// tslint:disable-next-line:no-floating-promises
main().then(() => {
    debug('success!');
}).catch((error) => {
    console.error(error);
});
