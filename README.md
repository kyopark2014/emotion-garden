# Emotion Garden

## Client에서 Emoton Garden을 구성하기 위해 필요한 API

### Emotion API

이미지로부터 Emotion 분석을 하기 위한 Emotion API는 아래와 같습니다. CloudFront를 이용한 Endpoint는 아래와 같습니다. HTTPS POST Method로 이미지를 전송하면 Emotion 결과를 리턴합니다. 상세한 정보는 [Emotion 분석](https://github.com/kyopark2014/emotion-garden/blob/main/emotion.md)에서 확인합니다.

```java
https://d3ic6ryvcaoqdy.cloudfront.net/emotion
```

### Garden API

Emotion으로 생성한 이미지를 조회하는 Garden API는 아래와 같습니다. 이미지 조회를 위한 API의 리소스 이름은 /garden 이고, HTTPS POST Method로 요청을 수행합니다. 상세한 정보는 [Garden 생성](https://github.com/kyopark2014/emotion-garden/blob/main/garden.md)에서 확인합니다.  

```java
https://d3ic6ryvcaoqdy.cloudfront.net/garden
```

## Stable Diffusion 이미지 생성하기

이미지 생성시간을 단축하기 위하여 병렬처리를 수행합니다. 상세한 내용은 [Stable Diffusion 이미지 생성하기](https://github.com/kyopark2014/emotion-garden/blob/main/stable-diffusion.md)를 참조합니다.

### 지원해상도 및 소요시간

현재 GPU를 이용해 계산한 결과는 아래와 같습니다.

#### Stable Diffusion 2.1
- XGA 1024 x 768 (x)

- WSVGA 1024 x 576 28s

- WSVGA 1024 x 600 30s

- DVGA 960 x 640 29s

- SVGA 800 x 600 22s

- (Basic) 768 x 512 17s

- VGA 640 x 480 15s

* Chrome 브라우저에서 요청시 timeout이 30s로 고정되어 있어서 실제 API는 성공하더라도 브라우저에 표시 안됨
  실행시간은 CPU 부하에 따라 변동됨
  
#### Stable Diffusion 2 fp16

- Basic: 768 x 512 (11s)

- WSVGA: 1024 x 600 (14s)

- WXGA: 1280 x 800 (26s)



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



## 이미지 백업 및 복구

#### 이미지 백업

아래 명령어로 이미지를 다운로드 합니다. 

```java
aws s3 cp s3://demo-emotion-garden/emotions/ . --recursive
```

#### 이미지 복원

아래 명령어로 이미지들을 다시 S3로 업로드 할 수 있습니다. 업로드되는 이미지는 S3 put event를 이용하여 DynamoDB의 "db-emotion-garden"에 저장됩니다. 

```java
aws s3 cp emotions/ s3://demo-emotion-garden/emotions/ --recursive
```

## Bulk로 이미지 생성 방법

1) 아래 사이트 접속
https://d3ic6ryvcaoqdy.cloudfront.net/html/bulk/bulk.html
2) RepeatCount는 같은 prompt로 생성하는 이미지의 숫자를 의미합니다.
3) Emotion을 선택하고,
4) 추가로 넣을 값 (Favorite)이 있을 경우에 입력합니다.
5) prompt에 넣을 여타 다른값들은 기본값을 유지. (수정할 수 있음)
기본값: garden, fantasy, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art

- [Generate]: 이미지 생성 버튼
- [Update] 생성된 이미지 확인
- [Remove] dislike로 불필요한 이미지 삭제

## S3에 저장된 이미지 확인
1) Preview에 접속합니다. https://d3ic6ryvcaoqdy.cloudfront.net/html/preview/preview.html
2) Emotion, Favorite를 선택합니다.
3) Retrieve를 선택하여 S3에 있는 이미지를 가져옵니다. 이미지가 많은 경우에 “Start”를 조정하면 뒤쪽의 이미지를 확인할 수 있습니다.
4) 불필요한 이미지는 dislike 선택후 [Remove] 버튼을 통해 삭제합니다. 


## ETC

- A flower with cat, fantasy, very happy, immature, smile, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art

<img width="1427" alt="image" src="https://user-images.githubusercontent.com/52392004/220819859-0c211084-6feb-4032-a365-b960044942a4.png">


## Reference

[[Python] 병렬처리(Multiprocessing)를 통한 연산속도 개선](https://yganalyst.github.io/data_handling/memo_17_parallel/)

[Running On-Demand P instances](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/ec2/quotas/L-417A185B)

[ml.p3.2xlarge for endpoint usage](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/sagemaker/quotas/L-1623D0BE)

[AI Art 모델인 Stable Diffusion을 쉽고 편리하게 이용하기](https://github.com/kyopark2014/stable-diffusion-api-server)

[How TO - CSS Loader](https://www.w3schools.com/howto/howto_css_loader.asp)

[Stable Diffusion 1 vs 2 - What you need to know](https://www.assemblyai.com/blog/stable-diffusion-1-vs-2-what-you-need-to-know/)

[How to generate stunning images using Stable Diffusion](https://babich.biz/how-to-use-stable-diffusion/)
