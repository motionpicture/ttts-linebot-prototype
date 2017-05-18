/**
 * パフォーマンスを検索する
 */
import * as createDebug from 'debug';
import * as request from 'request-promise-native';

const debug = createDebug('ttts-linebot-prototype:*');

async function main() {
    const response = await request.get({
        url: `${process.env.MP_API_ENDPOINT}/ja/performance/search`,
        json: true,
        qs: {
            day: '20171025'
        }
    }).promise();

    debug(response.results);
}

// tslint:disable-next-line:no-floating-promises
main().then(() => {
    debug('success!');
}).catch((error) => {
    console.error(error);
});
