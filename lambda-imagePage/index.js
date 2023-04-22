const aws = require('aws-sdk');
const domainName = process.env.domainName;
const msg = process.env.msg;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));
    
    let contentName = event['queryStringParameters'].content;
    console.log('content: ' + contentName);

    let url = `https://${domainName}/${contentName}`;
    let html = `<html><body><meta charset="UTF-8"><h2>AWS Seoul Seummit: Emotion Gardens</h2><img src=`+url+`><p>`+msg+`</p></body></html>`;
    console.log('html: ' + html);

    let response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: html
    };
    console.debug('response: ', JSON.stringify(response));

    return response;
};

