# Rekognition을 이용한 Emotion 분석

Amazon Rekognition을 이용하여 Emotion을 분석하는 Architecture는 아래와 같습니다. 

![image](https://user-images.githubusercontent.com/52392004/220984943-6299c008-b778-408c-b4a6-e975a720f45f.png)

API의 Resouce는 '/emotion'으로 아래와 같이 CloudFront Domain을 활용하여 RESTful API의 POST method로 요청합니다.

```java
https://d3ic6ryvcaoqdy.cloudfront.net/emotion
```

Client에서 사용할 수 있는 javascript 예제는 아래와 같습니다.

```java
const uri = "https://d3ic6ryvcaoqdy.cloudfront.net/emotion";
const xhr = new XMLHttpRequest();

xhr.open("POST", uri, true);
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
        alert(xhr.responseText); 
    }
};

var blob = new Blob([file], {type: 'image/jpeg'});
xhr.send(blob);
```

Rekognition을 이용하여 emotion을 분석후 아래와 같은 결과를 리턴합니다. 

```java
{
    "id": "bfc150a5-07ad-45a0-87e8-435e8a21d6ee",
    "bucket": "cdkemotiongardenstack-emotiongardenstorage163b614-18zt1jiogggyl",
    "key": "profile/bfc150a5-07ad-45a0-87e8-435e8a21d6ee.jpeg",
    "ageRange": {
        "Low": 13,
        "High": 21
    },
    "smile": true,
    "eyeglasses": true,
    "sunglasses": false,
    "gender": "Male",
    "beard": false,
    "mustache": false,
    "eyesOpen": true,
    "mouthOpen": true,
    "emotions": "HAPPY"
}
```

Rekognition의 감정분석 API는 아래를 참조합니다. 

[Facial analysis](https://github.com/kyopark2014/emotion-garden/blob/main/facial-analysis.md)

### 시험 방법
#### 브라우저로 Test Page Web을 접속하여 확인하는 방법

1) Test Page에 접속합니다. 여기서 test page의 주소는 "https://d3ic6ryvcaoqdy.cloudfront.net/emotion.html"입니다. CloudFront의 도메인은 변경될 수 있습니다. 

![noname](https://user-images.githubusercontent.com/52392004/221028091-bccaa180-896c-4fed-a2ec-859711cfe8b9.png)

2) [Choose File]로 파일을 선택하고, [Send]를 선택하면 아래와 같은 결과를 얻습니다.

![image](https://user-images.githubusercontent.com/52392004/221026247-82f891f6-0064-4a94-a80d-75a85a027719.png)


#### Curl 명령어로 확인하는 방법

Emotion을 확인하기 위해 아래처러 curl로 파일명을 지정하여 전송합니다.

```java
curl -i https://d3ic6ryvcaoqdy.cloudfront.net/emotion -X POST --data-binary '@bfeacaab-3aab-48e7-a4bc-f4edbe466826.jpeg' -H 'Content-Type: image/jpeg'
```

이때의 결과는 아래와 같습니다.

```java
HTTP/2 200
content-type: application/json
content-length: 359
date: Thu, 23 Feb 2023 20:59:10 GMT
x-amzn-requestid: 64513da8-5cde-453e-9591-b0f99181bd4b
x-amz-apigw-id: Az4AkENfoE0Ferg=
x-amzn-trace-id: Root=1-63f7d39c-575fea4367d7dcbf080a573f;Sampled=0
x-cache: Miss from cloudfront
via: 1.1 4e7cb5238b8bf39c2881bea34913cbf4.cloudfront.net (CloudFront)
x-amz-cf-pop: ICN54-C1
x-amz-cf-id: 6zrBBy0NAKT7ARC_dARICyzWAk2i78FWni5MIOl_oj8wZQxcnB77lg==

{"Id":"f10595b9-a664-4b99-a971-ea54ee359edf","Bucket":"cdkemotiongardenstack-emotiongardenstorage163b614-18zt1jiogggyl","Key":"profile/f10595b9-a664-4b99-a971-ea54ee359edf.jpeg","ageRange":{"Low":13,"High":21},"smile":true,"eyeglasses":true,"sunglasses":false,"gender":"Male","beard":false,"mustache":false,"eyesOpen":true,"mouthOpen":true,"emotions":"HAPPY"}%
```

