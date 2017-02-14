"use strict";
const express = require("express");
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
router.post("/webhook", (req, res) => {
    console.log("body:", req.body);
    res.send('successfully hook events.');
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
