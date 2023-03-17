const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const bucketName = process.env.bucketName;
const tableName = process.env.tableName;
const domainName = process.env.domainName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    const indexName = "Emotion-index"; // GSI
    let emotion = "happy";
    
    let queryParams = {
        TableName: tableName,
        IndexName: indexName,    
        KeyConditionExpression: "Emotion = :emotion",
        ExpressionAttributeValues: {
            ":emotion": emotion
        }
    };

    let dynamoQuery; 
    try {
        dynamoQuery = await dynamo.query(queryParams).promise();

        //  console.log('queryDynamo: '+JSON.stringify(dynamoQuery));
        console.log('queryDynamo: '+dynamoQuery.Count);      
    } catch (error) {
        console.log(error);
        return;
    }  

    //console.log("url: ", domainName+)

/*    function wait(){
        return new Promise((resolve, reject) => {
            if(!isCompleted) {
                setTimeout(() => resolve("wait..."), 1000)
            }
            else {
                setTimeout(() => resolve("done..."), 0)
            }
        });
    }
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait()); */

    const response = {
        statusCode: 200,
    };

    return response;
};