const aws = require('aws-sdk');
const sqs = new aws.SQS({apiVersion: '2012-11-05'});
const sqsBulkUrl = process.env.sqsBulkUrl;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    const body = Buffer.from(event["body"], "base64");
    const jsonData = JSON.parse(body)
    console.log('jsonData: ' + JSON.stringify(jsonData))

    console.log('MessageDeduplicationId: ' + jsonData.emotion+jsonData.index)
    try {
        let params = {
            // DelaySeconds: 10, // not allow for fifo
            MessageDeduplicationId: jsonData.emotion+jsonData.index,
            MessageAttributes: {},
            MessageBody: JSON.stringify(jsonData), 
            QueueUrl: sqsBulkUrl,
            MessageGroupId: "emotion"  // use single lambda for stable diffusion 
        };         
        console.log('params: '+JSON.stringify(params));

        let result = await sqs.sendMessage(params).promise();  
        console.log("result="+JSON.stringify(result));
    } catch (err) {
        console.log(err);
    } 

    const response = {
        statusCode: 200,
        body: JSON.stringify(jsonData)
    };
    return response;
};