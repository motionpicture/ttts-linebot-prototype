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
let router = express.Router();
router.get("/environmentVariables", (req, res) => {
    console.log("ip:", req.ip);
    res.json({
        data: {
            type: "envs",
            attributes: process.env
        }
    });
});
router.all("/webhook", (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log("body:", JSON.stringify(req.body));
    try {
        const event = req.body.events[0];
        if (event.type === 'message') {
            const message = event.message.text;
            const MID = event.source.userId;
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
            let reply = '...(´д≡; )';
            console.log(generateNextWordsResult);
            const candidates = generateNextWordsResult.candidates;
            if (candidates.length > 0) {
                reply = candidates[0].word;
            }
            yield request.post({
                simple: false,
                url: 'https://api.line.me/v2/bot/message/push',
                auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
                json: true,
                body: {
                    "to": MID,
                    "messages": [
                        {
                            "type": "text",
                            "text": reply
                        }
                    ]
                }
            });
        }
    }
    catch (error) {
        console.error(error);
    }
    res.send('successfully hook events.');
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
