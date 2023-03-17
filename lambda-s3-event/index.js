const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const bucketName = process.env.bucketName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    response = {
        statusCode: 200,
    }; 
    
    return response;
};