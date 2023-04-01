const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

import { parse } from "json2csv";

const bucketName = process.env.bucketName;
const userTableName = process.env.userTableName;
const interactionTableName = process.env.interactionTableName;
const itemTableName = process.env.itemTableName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));

    let params = {
        TableName: interactionTableName,
        //FilterExpression: "Emotion = :emotion",
        //ExpressionAttributeValues: {
        //    ":emotion": emotion
        //}
    };

    let dynamoScan; 
    try {
        dynamoScan = await dynamo.scan(params).promise();

        console.log('queryDynamo: '+JSON.stringify(dynamoScan[0]));
        console.log('queryDynamo: '+dynamoScan.Count);      
    } catch (error) {
        console.log(error);
        return;
    }  

    const payload = dynamoScan;
    const csvPayload = parse(payload, { 
        header: true, 
        defaultValue: "-----"
    });

    const s3Key = 'filename.csv';
    const bucketName = bucketName;

    await s3.put(bucketName, s3Key, csvPayload); 

    const response = {
        statusCode: 200,
        //body: JSON.stringify(result)
    };

    return response;
};
