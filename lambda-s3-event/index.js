const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;
const dynamodb = new aws.DynamoDB();

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))

    let isCompleted = false;
    for (let i in event.Records) {
        // Get the object from the event and show its content type
        const eventName = event.Records[i].eventName; // ObjectCreated:Put        
        console.log('eventName: ' + eventName);

        const bucket = event.Records[i].s3.bucket.name;
        const key = decodeURIComponent(event.Records[i].s3.object.key.replace(/\+/g, ' '));

        console.log('bucket: ' + bucket)
        console.log('key: ' + key)

        if (eventName == 'ObjectCreated:Put') {
            let date = new Date();
            const timestamp = Math.floor(date.getTime() / 1000).toString();

            const emotion = 'happy';
            //const feature0 = "";
            //const feature1 = "";
            //const feature2 = "";

            // putItem to DynamoDB
            let putParams = {
                TableName: tableName,
                Item: {
                    ObjKey: key,
                    Timestamp: timestamp,
                    Emotion: emotion,
                    //Feature0: feature0,
                    //Feature1: feature1,                    
                    //Feature2: feature2,                    
                }
            };
            console.log('putParams: ' + JSON.stringify(putParams));

            dynamo.put(putParams, function (err, data) {
                if (err) {
                    console.log('Failure: ' + err);
                }

                console.log('data: ' + JSON.stringify(data));
            });

            console.log('event.Records.length: ', event.Records.length);
            console.log('i: ', i);
            isCompleted = true;
        }
        else {
            var params = {
                TableName: tableName,
                Key: {
                    ObjKey: key,

                },
            };

            dynamo.delete(params, function (err, data) {
                if (err) {
                    console.log('Failure: ' + err);
                } else {
                    console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                }
            });

        }
    }

/*    function wait() {
        return new Promise((resolve, reject) => {
            if (!isCompleted) {
                setTimeout(() => resolve("wait..."), 1000)
            }
            else {
                setTimeout(() => resolve("done..."), 0)
            }
        });
    }
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait()); */

    const response = {
        statusCode: 200,
    };

    return response;
};