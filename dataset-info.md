# DataSet에 대한 정보를 수집

## Interaction DataSet 입력하기

[ambda-like](https://github.com/kyopark2014/emotion-garden/blob/main/lambda-like/index.js)에서 interaction과 관련된 정보를 수집합니다.

```java
const personalize = new aws.Personalize();
const trackingId = process.env.trackingId;
```

client가 보낸 like event를 interaction으로 처리하려고 합니다.

```java
    const body = JSON.parse(Buffer.from(event["body"], "base64"));
    console.log('likeInfo: ' + JSON.stringify(body));

    let userId = body['id'];
    console.log('userId: ', userId);

    let itemId = body['itemId'];
    console.log('itemId: ', itemId);

    let impression = body['impression'];
    console.log('impression: ', JSON.stringify(impression));
```    

Personalize에 putEvent로 like 정보를 전달합니다.

```java
    let date = new Date();
    const timestamp = date.getTime();
    
    var params = {            
            sessionId: itemId,
            trackingId: trackingId,
            userId: userId,
            eventList: [{
                eventType: "click",  // 'rating'
                sentAt: timestamp,
                eventId: uuidv4(),
                // eventValue: 11,                
                itemId: itemId,
                impression: impression,
            }],
    };
    
    const result = await personalizeevents.putEvents(params).promise();
```    
    

impression을 CSV 파일로 저장하기 위하여 DynamoDB에 이벤트 정보를 저장합니다. 이때 String으로 처리하기 위하여, JSON을 "|"으로 구분하여야 합니다. 

```java
        let impressionStr = "";
        if(impression.length==1) {
            impressionStr = impression[0];
        }
        else {
            let i=0;
            for(; i<impression.length-1; i++) {                
                impressionStr += impression[i];    
                impressionStr += '|'
            }
            impressionStr += impression[i]
        }
        console.log('impressionStr: ' + impressionStr);
        
        // DynamodB for personalize interactions
        var personalzeParams = {
            TableName: interactionTableName,
            Item: {
                USER_ID: userId,
                ITEM_ID: itemId,
                TIMESTAMP: timestamp,
                EVENT_TYPE: "click",
                IMPRESSION: impressionStr,
            }
        };
        console.log('personalzeParams: ' + JSON.stringify(personalzeParams));

        dynamo.put(personalzeParams, function (err, data) {
            if (err) {
                console.log('Failure: ' + err);
            }
            else {
                console.log('dynamodb put result: ' + JSON.stringify(data));
            }
        });
```



[lambda-like](https://github.com/kyopark2014/emotion-garden/blob/main/lambda-like/index.js) 정보를 DynamoDB를 수집합니다.

