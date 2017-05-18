"use strict";
/**
 * webhookルーターテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
describe('POST /webhook', () => {
    it('found', (done) => {
        supertest(app)
            .post('/webhook')
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.text, 'ok');
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
describe('枚数選択後のパフォーマンス検索', () => {
    it('ok', (done) => {
        supertest(app)
            .post('/webhook')
            .send({
            events: [
                {
                    postback: {
                        data: 'action=selectNumber'
                    },
                    replyToken: '26d0dd0923a94583871ecd7e6efec8e2',
                    source: {
                        type: 'user',
                        userId: 'U28fba84b4008d60291fc861e2562b34f'
                    },
                    timestamp: 1487085535998,
                    type: 'postback'
                }
            ]
        })
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.text, 'ok');
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
