"use strict";
const createDebug = require("debug");
const express = require("express");
const router = express.Router();
const debug = createDebug('sskts-linebot:*');
router.get('/environmentVariables', (req, res) => {
    debug('ip:', req.ip);
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
