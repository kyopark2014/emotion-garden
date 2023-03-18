const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.tableName;
const dynamodb = new aws.DynamoDB();

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    let isCompleted = false;
    for(let i in event.Records) {
        // Get the object from the event and show its content type
        const eventName =  event.Records[i].eventName; // ObjectCreated:Put        
        console.log('eventName: ' + eventName);

        const bucket = event.Records[i].s3.bucket.name;
        const key = decodeURIComponent(event.Records[i].s3.object.key.replace(/\+/g, ' '));
            
        console.log('bucket: ' + bucket)
        console.log('key: ' + key)

        if(eventName == 'ObjectCreated:Put') {
            let date = new Date();        
            const timestamp = Math.floor(date.getTime()/1000).toString();

            const emotion = 'happy';
            //const feature0 = "";
            //const feature1 = "";
            //const feature2 = "";

            // putItem to DynamoDB
            let putParams = {
                TableName: tableName,
                Item: {
                    ObjKey: key,
                    Timestamp: timestamp,
                    Emotion: emotion,
                    //Feature0: feature0,
                    //Feature1: feature1,                    
                    //Feature2: feature2,                    
                } 
            };
            console.log('putParams: ' + JSON.stringify(putParams));

            dynamo.put(putParams, function(err, data){
                if (err) {
                    console.log('Failure: '+err);
                } 

                console.log('data: '+JSON.stringify(data));
            });     
            
            console.log('event.Records.length: ', event.Records.length);
            console.log('i: ', i);
            isCompleted = true;
        }      
        else {
            var params = {
                TableName: tableName,
                Key: {
                    ObjKey: key
                },
              /*  ConditionExpression: "info.rating <= :val",
                ExpressionAttributeValues: {
                  ":val": 5.0
                } */
              };
              
              dynamo.delete(params, function(err, data) {
                if (err) {
                  console.error(
                    "Unable to update item. Error JSON:",
                    JSON.stringify(err, null, 2)
                  );
                } else {
                  console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                }
              });
            /*
            let deleteParams = {
                TableName: tableName,
                Key: {
                    ObjKey: {
                        S: key 
                      }
                } 
            };
            dynamodb.deleteItem(deleteParams, function(err, data){
                if (err) {
                    console.log('Failure: '+err);
                } 

                console.log('data: '+data); 
            });   */
            

         /*   var fileItem = {
                Key: {
                    ObjKey: {
                    N: "1234" // My partition key is a number.
                  }
                },
                TableName: tableName,
            };
            
            dynamo.deleteItem(fileItem, function(err, data) {
              if (err) {
                console.log(err, err.stack);
              }
              else {
                console.log(data);
              }
            }); */
        /*    const indexName = "Emotion-index"; // GSI
            var queryParams = {
                TableName: tableName,
                IndexName: indexName,    
                KeyConditionExpression: "Emotion = :emotion",
                ExpressionAttributeValues: {
                    ":emotion": emotion
                }
            };

            var dynamoQuery; 
            try {
                dynamoQuery = await dynamo.query(queryParams).promise();

                //  console.log('queryDynamo: '+JSON.stringify(dynamoQuery));
                console.log('queryDynamo: '+dynamoQuery.Count);      
            } catch (error) {
                console.log(error);
                return;
            }  */
        }  
    }

    /*try {
        const { ContentType } = await s3.getObject(params).promise();
        console.log('CONTENT TYPE:', ContentType);
    } catch (err) {
        console.log(err);
    }*/

    function wait(){
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
    console.log(await wait()); 

    const response = {
        statusCode: 200,
    };

    return response;
};