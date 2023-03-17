const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const bucketName = process.env.bucketName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    for(let i in event.Records) {
        // Get the object from the event and show its content type
        const eventName =  event.Records[i].eventName; // ObjectCreated:Put
        console.log('eventName: ' + eventName);

        const bucket = event.Records[i].s3.bucket.name;
        const key = decodeURIComponent(event.Records[i].s3.object.key.replace(/\+/g, ' '));
        const params = {
            Bucket: bucket,
            Key: key,
        }; 
        console.log('params: ' + JSON.stringify(params))
    }

    /*try {
        const { ContentType } = await s3.getObject(params).promise();
        console.log('CONTENT TYPE:', ContentType);
    } catch (err) {
        console.log(err);
    }*/

    const response = {
        statusCode: 200,
    };

    return response;
};