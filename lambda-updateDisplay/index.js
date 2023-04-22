const aws = require('aws-sdk');
const bucket = process.env.bucket;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));
    
    let response = {
        statusCode: 200,
        // body: html
    };
    console.debug('response: ', JSON.stringify(response));

    return response;
};

