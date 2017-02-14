import express = require('express');
import request = require('request-promise-native');
let router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.get("/environmentVariables", (req, res) => {
    console.log("ip:", req.ip);
    res.json({
        data: {
            type: "envs",
            attributes: process.env
        }
    });
});

router.all("/webhook", async (req, res) => {
    console.log("body:", JSON.stringify(req.body));

    try {
        const event: any = req.body.events[0];

        if (event.type === 'message') {
            const message = event.message.text;
            const MID = event.source.userId;

            // cognitiveで次のテキスト候補検索
            const generateNextWordsResult = await request.post({
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
            const candidates: any[] = generateNextWordsResult.candidates;
            if (candidates.length > 0) {
                reply = candidates[0].word;
            }

            // push message
            await request.post({
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
    } catch (error) {
        console.error(error);
    }

    res.send('successfully hook events.');
});

export default router;