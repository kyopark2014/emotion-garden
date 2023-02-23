# Emotion Garden

## Emotion 분석

Amazon Rekognition을 이용하여 Emotion을 분석하는 Architecture는 아래와 같습니다. 

![image](https://user-images.githubusercontent.com/52392004/220984943-6299c008-b778-408c-b4a6-e975a720f45f.png)

API의 Resouce는 '/emotion'으로 아래와 같이 CloudFront Domain을 활용하여 RESTful API의 POST method로 요청합니다.

```java
https://d1a0soheyg076e.cloudfront.net/emotion
```

Client에서 사용할 수 있는 javascript 예제는 아래와 같습니다.

```java
const uri = "https://d1a0soheyg076e.cloudfront.net/emotion";
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
    "Id": "bfc150a5-07ad-45a0-87e8-435e8a21d6ee",
    "Bucket": "cdkemotiongardenstack-emotiongardenstorage163b614-18zt1jiogggyl",
    "Key": "profile/bfc150a5-07ad-45a0-87e8-435e8a21d6ee.jpeg",
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

#### 시험방법 - Test Page

1) Test Page에 접속합니다. 여기서 test page의 주소는 "https://d1a0soheyg076e.cloudfront.net/emotion.html"입니다. CloudFront의 도메인은 변경될 수 있습니다. 

![noname](https://user-images.githubusercontent.com/52392004/221028091-bccaa180-896c-4fed-a2ec-859711cfe8b9.png)

2) [Choose File]로 파일을 선택하고, [Send]를 선택하면 아래와 같은 결과를 얻습니다.

![image](https://user-images.githubusercontent.com/52392004/221026247-82f891f6-0064-4a94-a80d-75a85a027719.png)


#### Curl Command

Emotion을 확인하기 위해 아래처러 curl로 파일명을 지정하여 전송합니다.

```java
curl -i https://d1a0soheyg076e.cloudfront.net/emotion -X POST --data-binary '@bfeacaab-3aab-48e7-a4bc-f4edbe466826.jpeg' -H 'Content-Type: image/jpeg'
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




## Stable Diffusion 이미지를 Parallel Processing을 이용해 생성하기

Stable Diffusion 이미지를 생성하기 위한 Architecture는 아래와 같습니다. 여기서는 데모의 원할한 진행을 위하여 여러개의 Endpoint를 만들어서 실행속도를 향상합니다. p3 2xlarge로 진행시 endpoint로 진행시 약 50초정도 소요되지만, 2개의 p3 2xlarge로 진행시는 14초 소요됩니다. 

<img width="716" alt="image" src="https://user-images.githubusercontent.com/52392004/220714782-1dc0a2e8-de35-4f53-8ebb-9b2a915a749b.png">


병렬처리 관련된 python 코드는 아래와 같습니다.

```python
procs = []    
urls = []
for num in range(0,nproc): # 2 processes
    proc = Process(target=stable_diffusion, args=(num, txt, mybucket, fname, endpoints[num],))
    urls.append("https://"+domain+'/'+fname+'_'+str(num)+'.jpeg')    
    procs.append(proc)
    proc.start()
        
for proc in procs:
    proc.join()

print("urls: ", urls)
```

#### 사용 예 

- happy 

```java
A flower, fantasy, happy, young, smile, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art, 8 k
```

<img width="814" alt="image" src="https://user-images.githubusercontent.com/52392004/220794172-ff8e29ae-381c-475c-b968-f88cec6ee908.png">

- unhappy

```java
- A flower, fantasy, unhappy, young, smile, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art, 8 k
```
<img width="818" alt="image" src="https://user-images.githubusercontent.com/52392004/220794856-9910072d-0bf6-465b-af11-ac70923d18b7.png">

- very happy, immature

```java
A flower, fantasy, very happy, immature, smile, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art
```

<img width="817" alt="image" src="https://user-images.githubusercontent.com/52392004/220795334-92ca5cfb-4ffb-44f2-9eac-45797a57dd24.png">

## 배포방법

### 코드 다운로드 및 CDK로 배포 

```java
git clone https://github.com/kyopark2014/emotion-garden
cd emotion-garden/cdk-emotion-garden && npm install aws-cdk-lib@2.64.0 path 
cdk deploy
```

설치가 다 끝나면 아래와 같은 화면이 나옵니다. 여기서 WebUrl은 "https://d24ksedrubh7x6.cloudfront.net/text2image.html" 이고, CloudFront의 모메인 이름은 "d24ksedrubh7x6.cloudfront.net"입니다.  

![noname](https://user-images.githubusercontent.com/52392004/220823062-e955834a-7c9d-40a1-8d92-e0424fa8529e.png)

cloud9에서 "emotion-garden/cdk-emotion-garden/lib/cdk-emotion-garden-stack.ts"을 아래처럼 열어서, lambda의 environment의 domain을 업데이트 합니다. 

![noname](https://user-images.githubusercontent.com/52392004/220823523-b70bdf9f-2918-41e9-93a6-48d8cba98fb6.png)

"html/text2image.html"에서 url의 domain 정보를 아래처럼 업데이트 합니다. 

![noname](https://user-images.githubusercontent.com/52392004/220823815-ab377db6-80c5-47e2-aeee-40ba1ca4a02f.png)

업데이트된 domain 정보를 반영하기 위하여 아래와 같이 다시 설치합니다.

```java
cdk deploy
```

브라우저에서 WebUrl인 "https://d24ksedrubh7x6.cloudfront.net/text2image.html" 로 접속합니다. 아래처럼 prompt를 변경하고 Send를 선택하여 Stable Image를 생성합니다.

![noname](https://user-images.githubusercontent.com/52392004/220824739-764a848a-d98c-4884-847c-8b8b12ecbf90.png)



## ETC

- A flower with cat, fantasy, very happy, immature, smile, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art

<img width="1427" alt="image" src="https://user-images.githubusercontent.com/52392004/220819859-0c211084-6feb-4032-a365-b960044942a4.png">


## Reference

[[Python] 병렬처리(Multiprocessing)를 통한 연산속도 개선](https://yganalyst.github.io/data_handling/memo_17_parallel/)

[Running On-Demand P instances](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/ec2/quotas/L-417A185B)

[ml.p3.2xlarge for endpoint usage](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/sagemaker/quotas/L-1623D0BE)

[AI Art 모델인 Stable Diffusion을 쉽고 편리하게 이용하기](https://github.com/kyopark2014/stable-diffusion-api-server)

[How TO - CSS Loader](https://www.w3schools.com/howto/howto_css_loader.asp)
