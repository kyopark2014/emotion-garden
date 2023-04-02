# 추천 리스트 읽어오기

[lambda-garden](https://github.com/kyopark2014/emotion-garden/blob/main/lambda-garden/index.js)에서는 사용자의 id를 가지고 해당 사용자에 대한 추천 이미지 리스트를 가져올 수 있습니다.

PersonalizeRuntime을 이용하여 추천정보를 가져올 수 있습니다.

```java
const aws = require('aws-sdk');
const personalizeRuntime = new aws.PersonalizeRuntime();
```

Personalize에 데이터 import후에 solution을 생성한다음에 campain을 배포하면, campaignArn을 얻어올 수 있습니다.

```java
const campaignArn = process.env.campaignArn
```
