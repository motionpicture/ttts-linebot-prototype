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
 * パフォーマンスを検索する
 */
const createDebug = require("debug");
const request = require("request-promise-native");
const debug = createDebug('ttts-linebot-prototype:*');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.get({
            url: `${process.env.MP_API_ENDPOINT}/ja/performance/search`,
            json: true,
            qs: {
                day: '20171025'
            }
        }).promise();
        debug(response.results);
    });
}
// tslint:disable-next-line:no-floating-promises
main().then(() => {
    debug('success!');
}).catch((error) => {
    console.error(error);
});
