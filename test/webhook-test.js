"use strict";
const assert = require("assert");
const HTTPStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
describe('POST /webhook', () => {
    it('found', (done) => {
        supertest(app)
            .post('/webhook')
            .expect(HTTPStatus.OK)
            .then((response) => {
            assert.equal(response.text, 'ok');
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
