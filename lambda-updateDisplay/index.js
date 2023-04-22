const aws = require('aws-sdk');
const bucket = process.env.bucket;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));

    let zoneName = 'zone1';

    let keyLandscape = [];
    for(let i=0;i<8;i++) {
        keyLandscape.push(`display/${zoneName}/img${i}h.jpeg`);
    }
    console.log('key landscape: ', JSON.stringify(keyLandscape));

    let keyPortlate = [];
    for(let i=0;i<8;i++) {
        keyPortlate.push(`display/${zoneName}/img${i}v.jpeg`);
    }
    console.log('key landscape: ', JSON.stringify(keyPortlate));
    


    
    let response = {
        statusCode: 200,
        // body: html
    };
    console.debug('response: ', JSON.stringify(response));

    return response;
};

