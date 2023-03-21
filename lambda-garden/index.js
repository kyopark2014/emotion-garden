const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;
const indexName = process.env.indexName;
const domainName = process.env.domainName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));
    
    console.log('indexName: ' + indexName);

    const body = JSON.parse(Buffer.from(event["body"], "base64"));
    console.log('body: ' + JSON.stringify(body));

    let emotion = body['emotion'];
    console.log('emotion: ', emotion);
    
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

        console.log('queryDynamo: '+JSON.stringify(dynamoQuery));
        console.log('queryDynamo: '+dynamoQuery.Count);      
    } catch (error) {
        console.log(error);
        return;
    }  

    let urlList = [];
    for(let i in dynamoQuery['Items']) {
        const objKey = dynamoQuery['Items'][i]['ObjKey'];
        // const timestamp = dynamoQuery['Items'][i]['Timestamp'];
        // const emotion = dynamoQuery['Items'][i]['Emotion'];

        // console.log('objKey: ', objKey);
        // console.log('timestamp: ', timestamp);
        // console.log('emotion: ', emotion);
        
        const url = 'https://'+domainName+'/'+objKey;
        // console.log('url: ', url);

        urlList.push(url);
    }

    console.log('urlList: ', JSON.stringify(urlList));

    let landscape = [];
    let portrait = [];
    for(let i in urlList) {
        let pos = urlList[i].indexOf('.jpeg');
        // console.log("pos: ", pos);
        
        let identifier = urlList[i][pos - 1];
        // console.log("identifier: ", identifier);    

        if (identifier == 'v') {
            portrait.push(urlList[i]);
        }
        else {
            landscape.push(urlList[i]);
        }
    }
    console.log('landscape: ', JSON.stringify(landscape));
    console.log('portrait: ', JSON.stringify(portrait));
    
    let result = {
        landscape: landscape,
        portrait: portrait
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify(result)
    };

    return response;
};