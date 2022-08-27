const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';

    try {
        switch (event.httpMethod) {
            case 'GET':
                const gameId = event.pathParameters.id;
                console.log("Getting game: ${gameId}!");
                body = await getGame(gameId);
                break;
            case 'POST':
                const game = JSON.parse(event.body); // TODO: Remove other fields
                
                if(!game.userId || !game.result || !game.result.matches || !game.result.attempts) {
                    statusCode = 400;
                    body = {"message": "Incorrect syntax"};
                    break;
                }
                
                const user = await getUser(game.userId);
                console.log(user);
                
                if(!user) {
                    statusCode = 404;
                    body = {"message": "User not found"};
                    break;
                }
                
                game.id = context.awsRequestId;
                const params = {
                    TableName: 'Game',
                    Item: game,
                    ConditionExpression: "attribute_not_exists(id)"

                };
                await dynamo.put(params).promise();
                body = game;
                break;
            case 'OPTIONS':
                const response = {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Headers" : "Content-Type",
                        "Access-Control-Allow-Origin": "*", // TODO: Check for localhost:3000 and github.io later.
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

async function getGame(gameId) {
    var params = {
            "Key": { 
                "id" : gameId
            },
            TableName: 'Game'
        };
        var result = await dynamo.get(params).promise();
        return result.Item;
}

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
