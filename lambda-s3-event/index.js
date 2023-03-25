const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;
const Jimp = require('jimp');
const s3 = new aws.S3();

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

        var splitKey = key.split("/");
        console.log('splitKey: ' + splitKey);
        console.log('length: ' + splitKey.length);

        let emotion, favorite, fname;

        if (splitKey.length == 3) {
            emotion = splitKey[1];
            console.log('emotion: ', emotion);
            fname = splitKey[2];
            console.log('fname: ', fname);
        }
        else if (splitKey.length == 4) {
            emotion = splitKey[1];
            console.log('emotion: ', splitKey[1]);
            favorite = splitKey[2];
            console.log('favorite: ', splitKey[2])
            fname = splitKey[3];
            console.log('fname: ', splitKey[3]);
        }
        else {
            console.log('error: ', splitKey);
        }

        if (eventName == 'ObjectCreated:Put') {
            let date = new Date();
            const timestamp = Math.floor(date.getTime() / 1000).toString();

            // putItem to DynamoDB
            let putParams;
            let searchKey;
            if (splitKey.length >= 4) {
                searchKey = emotion + '/' + favorite
            }
            else if (splitKey.length == 3) {
                searchKey = emotion
            }
            else {
                return response = {
                    statusCode: 500,
                    body: splitKey
                };
            }

            const control = GenerateControl(bucket, key);

            putParams = {
                TableName: tableName,
                Item: {
                    ObjKey: key,
                    Timestamp: timestamp,
                    Emotion: searchKey,
                    Control: control
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
        else if (eventName == 'ObjectRemoved:Delete') {
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

    function wait() {
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
    console.log(await wait());

    const response = {
        statusCode: 200,
    };

    return response;
};

function GenerateControl(bucket, key) {
    let origimage;
    try {
        const params = {
            Bucket: bucket,
            Key: key
        };        

        origimage = s3.getObject(params).promise(); 

        console.log('params: ' + JSON.stringify(params));
    } catch (error) {
        console.log(error);
        return;
    } 
    
    let objectData = data.Body.toString('utf-8');

    console.log('objectData: ' + objectData);




    return {
        first: {
            R: 100, G: 100, B: 0
        },
        second: {
            R: 100, G: 0, B: 0
        }
    }
}