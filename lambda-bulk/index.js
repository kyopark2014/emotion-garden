const bucketName = process.env.bucketName;
const sqsBulkUrl = process.env.sqsBulkUrl;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    const body = Buffer.from(event["body"], "base64");
    console.log('body: ' + body)

    try {
        let params = {
            DelaySeconds: 10,
            MessageAttributes: {},
            MessageBody: JSON.stringify(body), 
            QueueUrl: sqsBulkUrl
        };         
        console.log('params: '+JSON.stringify(params));

        let result = await sqs.sendMessage(params).promise();  
        console.log("result="+JSON.stringify(result));
    } catch (err) {
        console.log(err);
    } 

    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };
    return response;
};