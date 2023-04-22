const aws = require('aws-sdk');
const domainName = process.env.domainName;
const msg = "This image was created by Stable Diffusion v2-1 base from SageMaker JumpStart for demonstration purposes. This model is available under the CreativeML Open RAIL++-M license: License. This is a text-to-image model from Stability AI and downloaded from HuggingFace. It takes a textual description as input and returns a generated image from the description.";

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));
    
    let contentName = event['queryStringParameters'].content;
    console.log('content: ' + contentName);

    let url = `https://${domainName}/${contentName}`;
    let html = `<html><body><meta charset="UTF-8"><h2>AWS Seoul Summit: Emotion Gardens</h2><img src=`+url+`><p>`+msg+`</p></body></html>`;
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

