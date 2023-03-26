const aws = require('aws-sdk');
const sqs = new aws.SQS({apiVersion: '2012-11-05'});
const tableName = process.env.tableName;
const datasetArn = process.env.datasetArn;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    const body = Buffer.from(event["body"], "base64");
    const jsonData = JSON.parse(body)
    console.log('jsonData: ' + JSON.stringify(jsonData));

    /*let key = jsonData.key;
    let timestamp = jsonData.timestamp;
    let searchKey = jsonData.searchKey

    // const control = getControlParameters(bucket, key, emotion);
    let putParams;
    putParams = {
        TableName: tableName,
        Item: {
            ObjKey: key,
            Timestamp: timestamp,
            Emotion: searchKey,
            // Control: control
        }
    };
    console.log('putParams: ' + JSON.stringify(putParams));

    dynamo.put(putParams, function (err, data) {
        if (err) {
            console.log('Failure: ' + err);
        }
        else {
            console.log('data: ' + JSON.stringify(data));
        }
    });

    // create item dataset
    try {
        var params = {
            datasetArn: datasetArn,
            items: [{
                itemId: key,
                properties: {
                    "TIMESTAMP": timestamp,
                    "EMOTION": searchKey,
                }
            }]
        };
        console.log('user params: ', JSON.stringify(params));

        const result = await personalizeevents.putItems(params).promise(); 
        console.log('putItem result: '+JSON.stringify(result));

        isCompleted = true;   
    } catch (error) {
        console.log(error);
        isCompleted = true;

        response = {
            statusCode: 500,
            body: error
        };
    } */

    const response = {
        statusCode: 200,
        // body: JSON.stringify(jsonData)
    };
    return response;
};