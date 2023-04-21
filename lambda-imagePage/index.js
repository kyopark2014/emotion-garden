const aws = require('aws-sdk');
const domainName = process.env.domainName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));
    

    let response = {
        statusCode: 200,
        // body: JSON.stringify(result)
    };
    console.debug('response: ', JSON.stringify(response));

    return response;
};

