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
const HTTPStatus = require("http-status");
const webhookController = require("../conrtollers/webhook");
const router = express.Router();
const debug = createDebug('sskts-linebot:*');
router.all('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
    debug('body:', JSON.stringify(req.body));
    try {
        const event = (req.body.events) ? req.body.events[0] : undefined;
        if (event) {
            switch (event.type) {
                case 'message':
                    webhookController.message(event);
                    break;
                case 'postback':
                    webhookController.postback(event);
                    break;
                default:
                    break;
            }
        }
    }
    catch (error) {
        console.error(error);
    }
    res.status(HTTPStatus.NO_CONTENT).end();
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
