const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';

    try {
        switch (event.httpMethod) {
            case 'GET':
                const userId = event.pathParameters.id;
                console.log("Getting user: ${userId}!");
                body = await getUser(userId); // TODO: 404
                break;
            case 'POST': {
                const user = JSON.parse(event.body);
                if(!user.nickName) // TODO: Remove other fields
                {    statusCode = 400;
                    body = JSON.stringify({"message": "Incorrect syntax"});
                    break;
                }
                user.id = context.awsRequestId; // TODO: Do better
                const params = {
                    TableName: 'User',
                    Item: user,
                    ConditionExpression: "attribute_not_exists(id)",
                    ReturnValues: 'NONE'
                };
                await dynamo.put(params).promise();
                body = user; // TODO: Try to get this from the database
                break;
            }
            case 'PUT': { // Disallow this from being called from http, this should be called only in the cognito flow
                const user = JSON.parse(event.body);
                if(!user.id || !user.name || !user.email || !user.nickName) // TODO: Remove other fields
                {    statusCode = 400;
                    body = JSON.stringify({"message": "Incorrect syntax"});
                    break;
                }
                const dto = {
                    TableName: 'User',
                    Item: user,
                    ReturnValues: 'ALL_OLD'
                };
                body = await dynamo.put(dto).promise();
                break;
            }
            case 'OPTIONS':
                const response = {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Headers" : "Content-Type",
                        "Access-Control-Allow-Origin": "localhost", // TODO: Check for localhost:3000 and github.io later.
                        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                    },
                    body: {},
                };
                return response;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        if (err.code === 'ConditionalCheckFailedException') {
            statusCode = '409';
            body = {
                "message": "Cannot update."
            };
        } else {
            statusCode = '400';
            body = err.message;
        }
    } finally {
        body = JSON.stringify(body);
    }

    
    return {
        statusCode,
        body,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", // TODO: Check for localhost:3000 and github.io later.
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
    };
};

async function getUser(userId) {
    var params = {
            "Key": { 
                "id" : userId
            },
            TableName: 'User'
        };
        var result = await dynamo.get(params).promise();
        return result.Item;
}
