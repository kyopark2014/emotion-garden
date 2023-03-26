const aws = require('aws-sdk');
const personalizeevents = new aws.PersonalizeEvents();
const datasetArn = process.env.datasetArn;
const datasetGroupArn = process.env.datasetGroupArn;
const personalize = new aws.Personalize();

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event));

    const body = JSON.parse(Buffer.from(event["body"], "base64"));
    console.log('likeInfo: ' + JSON.stringify(body));

    let userId = body['id'];
    console.log('userId: ', userId);

    let itemId = body['itemId'];
    console.log('itemId: ', itemId);

    let impression = body['impression'];
    console.log('impression: ', JSON.stringify(impression));

    let trackingId = "a8868cee-3669-4a18-ad66-7f42035807d9";
 /*   
    var params = {
        datasetGroupArn: datasetGroupArn, 
        name: "eventTracker",
    };
 
    try {
        const result = await personalize.createEventTracker(params).promise();
        console.log('putEvent result: ' + JSON.stringify(result));
        trackingId = result.trackingId;
    } catch (error) {
        console.log(error);
        isCompleted = true;

        response = {
            statusCode: 500,
            body: error
        };
    } */


    let date = new Date();
    const timestamp = date.getTime();
    console.log('timestamp: ', timestamp);

    let response;
    let isCompleted = false;
    // put event dataset
    try {
        var params = {            
            sessionId: '1',
            trackingId: trackingId,
            userId: userId,
            eventList: [{
                eventType: "click",  // 'rating'
                sentAt: timestamp,
                eventId: userId,
                // eventValue: 11,                
                itemId: itemId,
                impression: impression,
            }],
        };
        console.log('event params: ', JSON.stringify(params));

        const result = await personalizeevents.putEvents(params).promise();
        console.log('putEvent result: ' + JSON.stringify(result));

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