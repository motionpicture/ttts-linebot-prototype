import request = require('request-promise-native');

async function main() {
    const response = await request.get({
        url: 'https://devtttsapiprototype.azurewebsites.net/ja/performance/search',
        json: true,
        qs: {
            day: '20171025'
        }
    });

    console.log(response.results);
}

try {
    main();
} catch (error) {
    console.error(error);
}
