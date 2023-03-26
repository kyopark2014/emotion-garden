const aws = require('aws-sdk');
const sqs = new aws.SQS({apiVersion: '2012-11-05'});
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;
const datasetArn = process.env.datasetArn;
const sqsUrl = process.env.sqsUrl;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    const records = event['Records'];
    console.log('records: ' + JSON.stringify(records));

    for(let i in records) {
        let receiptHandle = records[i].receiptHandle;

        const body = JSON.parse(records[i].body);
        console.log('body: ' + JSON.stringify(body));

        let key = body.key;
        let timestamp = body.timestamp;
        let searchKey = body.searchKey
        
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
        }

        // delete queue message
        try {
            let deleteParams = {
                QueueUrl: sqsUrl,
                ReceiptHandle: receiptHandle
            };
        
            sqs.deleteMessage(deleteParams, function(err, data) {
                if (err) {
                    console.log("Error", err);
                } else {
                    console.log("deleting messagQueue: ", data.ResponseMetadata.RequestId);
                }
            });
        } catch (err) {
            console.log(err);
        } 
    }
    
    const response = {
        statusCode: 200,
    };
    return response;
};