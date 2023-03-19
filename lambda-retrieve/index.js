const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;
const indexName = process.env.indexName;
const domainName = process.env.domainName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    console.log('indexName: ' + indexName);

    let emotion = event.emotion;
    
    let queryParams = {
        TableName: tableName,
        IndexName: indexName,    
        KeyConditionExpression: "Emotion = :emotion",
        ExpressionAttributeValues: {
            ":emotion": emotion
        }
    };

    let dynamoQuery; 
    try {
        dynamoQuery = await dynamo.query(queryParams).promise();

        console.log('queryDynamo: '+JSON.stringify(dynamoQuery));
        console.log('queryDynamo: '+dynamoQuery.Count);      
    } catch (error) {
        console.log(error);
        return;
    }  

    let urlList = [];
    for(let i in dynamoQuery['Items']) {
        const objKey = dynamoQuery['Items'][i]['ObjKey'];
        // const timestamp = dynamoQuery['Items'][i]['Timestamp'];
        // const emotion = dynamoQuery['Items'][i]['Emotion'];

        // console.log('objKey: ', objKey);
        // console.log('timestamp: ', timestamp);
        // console.log('emotion: ', emotion);
        
        const url = domainName+'/'+objKey;
        // console.log('url: ', url);

        urlList.push(url);
    }

    console.log('urlList: ', JSON.stringify(urlList));

    const response = {
        statusCode: 200,
        body: JSON.stringify(urlList)
    };

    return response;
};