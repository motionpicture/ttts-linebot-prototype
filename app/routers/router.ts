import express = require('express')
let router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.get("/environmentVariables", (req, res) => {
    console.log("ip:", req.ip);
    // this.logger.debug("process.env:", process.env);
    res.json({
        data: {
            type: "envs",
            attributes: process.env
        }
    });
});

router.post("/webhook", (req, res) => {
    console.log("body:", JSON.stringify(req.body));
    res.send('successfully hook events.');
});

export default router;