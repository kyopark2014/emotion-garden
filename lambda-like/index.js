const aws = require('aws-sdk');
const personalizeevents = new aws.PersonalizeEvents();
const datasetArn = process.env.datasetArn;
const trackingId = process.env.trackingId;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));

    const body = JSON.parse(Buffer.from(event["body"], "base64"));
    console.log('likeInfo: ' + JSON.stringify(body));
    
    let userId = body['id'];
    console.log('userId: ', userId);

    let itemId = body['itemId'];
    console.log('itemId: ', itemId);

    let candidate = body['candidate'];
    let impression;
    if(candidate.length==1) impression = candidate[0];
    else if(candidate.length==2) impression = candidate[0]+'|'+candidate[1];
    else {
        impression = candidate[0]+'|'+candidate[1]+'|'+candidate[2];
    }
    console.log('impression: ', impression);

    const timestamp = date.getTime();
    console.log('timestamp: ', timestamp);

    let response;
    // put event dataset
    try {
        var params = {
            trackingId: trackingId,
            sessionId: '1',
            userId: userId,
            eventList: [{
                "ITEM_ID": itemId,
                "TIMESTAMP": timestamp,
                "EVENT_TYPE": "click",
                "IMPRESSION": impression,
            }]
        };
        console.log('event params: ', JSON.stringify(params));

        const result = await personalizeevents.putEvents(params).promise(); 
        console.log('putEvent result: '+JSON.stringify(result));

        isCompleted = true;   

        response = {
            statusCode: 200,
            body: "Success"
        };     
    } catch (error) {
        console.log(error);
        isCompleted = true;

        response = {
            statusCode: 500,
            body: error
        };
    }
    
    function wait() {
        return new Promise((resolve, reject) => {
            if (!isCompleted) {
                setTimeout(() => resolve("wait..."), 1000);
            }
            else {
                setTimeout(() => resolve("done..."), 0);
            }
        });
    }
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());
    console.log(await wait());

    return response;
};