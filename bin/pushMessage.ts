// const line = require('node-line-bot-api');

// // init with auth
// line.init({
//     accessToken: '15527dfc3fb36a1609b736de0692db44',
//     channelSecret: 'w+bO2kJmELjrzeD8lH6qm1h5aHb4BcDAgWdcSWk/rMYLe/45jMXfd566NXS5DQF+CtxRaa2UNrzspUov6JrU0jVQh53eMZJN9gKiGTAWh8Z1Z12VQAISyb1f57Gvv+cxHy7cZB5yqjxCRtqzWoENhAdB04t89/1O/w1cDnyilFU='
// })

// // simple push message with user MID
// line.client.pushMessage({
//     to: 'ilovegadd',
//     messages: [
//         {
//             "type": "text",
//             "text": "Hello, world1"
//         },
//         {
//             "type": "text",
//             "text": "Hello, world2"
//         }
//     ]
// })

import * as request from 'request'

request.post(
    'https://api.line.me/v2/bot/message/push',
    {
        auth: { bearer: 'w+bO2kJmELjrzeD8lH6qm1h5aHb4BcDAgWdcSWk/rMYLe/45jMXfd566NXS5DQF+CtxRaa2UNrzspUov6JrU0jVQh53eMZJN9gKiGTAWh8Z1Z12VQAISyb1f57Gvv+cxHy7cZB5yqjxCRtqzWoENhAdB04t89/1O/w1cDnyilFU=' },
        json: true,
        body: {
            "to": "ilovegadd",
            "messages": [
                {
                    "type": "text",
                    "text": "Hello, world1"
                },
                {
                    "type": "text",
                    "text": "Hello, world2"
                }
            ]
        }

    }, (err, response, body) => {
        console.log(err, response.statusCode, body);
    })