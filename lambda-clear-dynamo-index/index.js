const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))

    const body = JSON.parse(Buffer.from(event["body"], "base64"));
    console.log('body: ' + JSON.stringify(body));

    let objName = JSON.parse(body['objName']);
    console.log('objName: ', objName);

    var params = {
        TableName: tableName,
        Key: {
            ObjKey: objName,
        },
    };

    dynamo.delete(params, function (err, data) {
        if (err) {
            console.log('Failure: ' + err);
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });

    const response = {
        statusCode: 200,
        body: JSON.stringify(urlList)
    };

    return response;
};