/**
 * パフォーマンスを検索する
 */
import * as createDebug from 'debug';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-linebot:*');

async function main() {
    const response = await request.get({
        url: process.env.MP_API_ENDPOINT + '/ja/performance/search',
        json: true,
        qs: {
            day: '20171025'
        }
    });

    debug(response.results);
}

try {
    main();
} catch (error) {
    console.error(error);
}
