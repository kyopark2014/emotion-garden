const aws = require('aws-sdk');
const bucketName = process.env.bucketName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    
    const response = {
        statusCode: 200,
        // body: JSON.stringify(urlList)
    };

    return response;
};