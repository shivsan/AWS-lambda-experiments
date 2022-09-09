const https = require('https');

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
 const body = {
          "query":"fragment baseRoomFields on Room {\n  id\n  code\n  bookable\n  availableDate\n  shareType\n  amenities\n  images {\n    url\n    __typename\n  }\n  rent {\n    amount\n    currencySymbol\n    __typename\n  }\n  area {\n    unit\n    value\n    __typename\n  }\n  apartment {\n    id\n    floor\n    bedrooms\n    amenities\n    images {\n      url\n      __typename\n    }\n    __typename\n  }\n  property {\n    id\n    code\n    coordinates {\n      latitude\n      longitude\n      __typename\n    }\n    neighbourhood {\n      name\n      __typename\n    }\n    amenities\n    images {\n      url\n      __typename\n    }\n    address {\n      addressLine1\n      city\n      __typename\n    }\n    __typename\n  }\n}\n\nquery RoomCollection($where: RoomFilter, $limit: Int, $offset: Int) {\n  roomCollection(where: $where, limit: $limit, offset: $offset) {\n    items {\n      ...baseRoomFields\n      __typename\n    }\n    __typename\n  }\n}",
          "operationName":"RoomCollection",
          "variables":{
            "where":
              {
                "city":"Berlin","availableFrom":"2022-10-10","shareType":"PRIVATE_APARTMENT","bookable":true
              },
            "limit":2000
          }
        };
  
 const options = {
  hostname: 'www.habyt.com',
  port: 443,
  path: '/api/graphql',
  method: 'POST',
  body: body,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(body).length
  },
};
 
exports.handler = async event => {
  try {
    const result = await postRequest({
      name: 'John Smith',
      job: 'manager',
    });
    console.log('result is: 👉️', result);

    // 👇️️ response structure assume you use proxy integration with API gateway
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.log('Error is: 👉️', error);
    return {
      statusCode: 400,
      body: error.message,
    };
  }
};

function postRequest() {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          console.log("Call done")
          console.log(JSON.stringify(rawData));
          resolve(JSON.parse(rawData));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on('error', err => {
      reject(new Error(err));
    });

    // 👇️ write the body to the Request object
    req.write(JSON.stringify(body));
    req.end();
  });
}
