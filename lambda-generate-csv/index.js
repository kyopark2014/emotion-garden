const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;

import { parse } from "json2csv";

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));

    let params = {
        TableName: tableName,
        //FilterExpression: "Emotion = :emotion",
        //ExpressionAttributeValues: {
        //    ":emotion": emotion
        //}
    };

    let dynamoQuery; 
    try {
        dynamoQuery = await dynamo.scan(params).promise();

        console.log('queryDynamo: '+JSON.stringify(dynamoQuery));
        console.log('queryDynamo: '+dynamoQuery.Count);      
    } catch (error) {
        console.log(error);
        return;
    }  

    /* 
    var params = {
    TableName: "NOTIFICATION",
    FilterExpression: "user_id = :user_id and category = :category",
    ExpressionAttributeValues: {
        ":user_id": user_id,
        ":category": category
    }
}

docClient.scan(params).promise()
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    });*/

/*    const payload = [{ a: 1, b: 2 }]
    const csvPayload = parse(payload, { header: true, defaultValue: "-----"});

    const s3Key = 'filename.csv';
    const bucketName = 'bucket-name';

    await s3.put(bucketName, s3Key, csvPayload); */

    const response = {
        statusCode: 200,
        //body: JSON.stringify(result)
    };

    return response;
};
