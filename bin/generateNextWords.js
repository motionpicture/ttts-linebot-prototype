"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * cognitive serviceでnext wordsを検索する
 */
const createDebug = require("debug");
const request = require("request");
const debug = createDebug('sskts-linebot:*');
request.post('https://westus.api.cognitive.microsoft.com/text/weblm/v1.0/generateNextWords', {
    headers: {
        'Ocp-Apim-Subscription-Key': 'ecdeb8bb4a5f481ab42e2ff2b765c962'
    },
    json: true,
    qs: {
        model: 'query',
        words: '映画予約'
    }
}, (err, response, body) => {
    debug(err, response.statusCode, body);
});
