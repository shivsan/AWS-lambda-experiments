const https = require('https');

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
 const options = {
  hostname: 'www.habyt.com/api/graphql',
  port: 443,
  path: '/',
  method: 'POST'
};
 
exports.handler = (event, context, callback) => {
    
    
    const req = https.request(options, (res) => {
        let body = '{"query":"fragment baseRoomFields on Room {\n  id\n  code\n  bookable\n  availableDate\n  shareType\n  amenities\n  images {\n    url\n    __typename\n  }\n  rent {\n    amount\n    currencySymbol\n    __typename\n  }\n  area {\n    unit\n    value\n    __typename\n  }\n  apartment {\n    id\n    floor\n    bedrooms\n    amenities\n    images {\n      url\n      __typename\n    }\n    __typename\n  }\n  property {\n    id\n    code\n    coordinates {\n      latitude\n      longitude\n      __typename\n    }\n    neighbourhood {\n      name\n      __typename\n    }\n    amenities\n    images {\n      url\n      __typename\n    }\n    address {\n      addressLine1\n      city\n      __typename\n    }\n    __typename\n  }\n}\n\nquery RoomCollection($where: RoomFilter, $limit: Int, $offset: Int) {\n  roomCollection(where: $where, limit: $limit, offset: $offset) {\n    items {\n      ...baseRoomFields\n      __typename\n    }\n    __typename\n  }\n}","operationName":"RoomCollection","variables":{"where":{"city":"Berlin","availableFrom":"2022-10-10","shareType":"PRIVATE_APARTMENT","bookable":true},"limit":2000}}';
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Successfully processed HTTPS response');
            // If we know it's JSON, parse it
            if (res.headers['content-type'] === 'application/json') {
                body = JSON.parse(body);
            }
            console.log(body);
        });
    });
    req.on('error', callback);
    req.write(JSON.stringify({}));
    req.end();
};
