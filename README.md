# Emotion Garden

## Client에서 Emoton Garden을 구성하기 위해 필요한 API

### Emotion API

이미지로부터 Emotion 분석을 하기 위한 Emotion API는 아래와 같습니다. CloudFront를 이용한 Endpoint는 아래와 같습니다. HTTPS POST Method로 이미지를 전송하면 Emotion 결과를 리턴합니다. 상세한 정보는 [Emotion 분석](https://github.com/kyopark2014/emotion-garden/blob/main/emotion.md)에서 확인합니다.

```java
https://d3ic6ryvcaoqdy.cloudfront.net/emotion
```

### Garden API

Emotion으로 생성한 이미지를 조회하는 Garden API는 아래와 같습니다. 이미지 조회를 위한 API의 리소스 이름은 /garden 이고, HTTPS POST Method로 요청을 수행합니다. 상세한 정보는 [Garden API](https://github.com/kyopark2014/emotion-garden/blob/main/garden.md)에서 확인합니다.  

```java
https://d3ic6ryvcaoqdy.cloudfront.net/garden
```

## 배포방법

Emotion Garden을 설치하는 방법은 [Emotion Garden 배포 방법](https://github.com/kyopark2014/emotion-garden/blob/main/deployment.md)에 따라 진행합니다. 


## 각종 Test용 웹 페이지 정보

### Emotion 

Emotion 분석을 테스트할 수 있는 웹사이트입니다. 

1) "https://d3ic6ryvcaoqdy.cloudfront.net/html/emotion/emotion.html" 로 접속합니다.
2) [Video] 버튼을 선택하여 비디오 사용을 allow 해줍니다. 
3) [Emotion] 버튼을 선택하여 화면 캡춰를 수행하면, [Emotion API](https://github.com/kyopark2014/emotion-garden#emotion-api)로 접속하여 Emotion 분석을 수행하고 결과를 하단에 보여줍니다. 

이때의 결과의 예는 아래와 같습니다.

```java
Emotion: 평온 (CALM)
Age: 13 ~ 21 (남자)
Features: 안경 눈뜨고있음
```


### Garden

Emotion 분석으로 얻어진 결과로 생성된 Stable Diffusion 이미지를 보여줍니다. 

1) "https://d3ic6ryvcaoqdy.cloudfront.net/html/garden/garden.html" 로 접속합니다.
2) [Video] 버튼을 선택하여 비디오 사용을 allow 해줍니다. 
3) Favorite에 좋아하는 동물이나 사물을 추가할 수 있습니다. 단, 미리 정의되지 않은 Favorite의 경우에는 "No images"로 보여줍니다. 
4) [Emotion] 버튼을 선택하여 화면 캡춰된 이미지로 Emotion분석을 한 후에, [Garden API](https://github.com/kyopark2014/emotion-garden#garden-api)를 이용하여 미리 생성된 Stable Diffusion 이미지들을 보여줍니다. 이때 얻어진 결과의 예는 아래와 같습니다.

![image](https://user-images.githubusercontent.com/52392004/226776991-487287f3-860f-49fc-a40d-ebaaad9bae1c.png)

5) 이미지를 선택하면 다른 이미지들을 순차적으로 보여줍니다. 



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



## Reference

[[Python] 병렬처리(Multiprocessing)를 통한 연산속도 개선](https://yganalyst.github.io/data_handling/memo_17_parallel/)

[Running On-Demand P instances](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/ec2/quotas/L-417A185B)

[ml.p3.2xlarge for endpoint usage](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/sagemaker/quotas/L-1623D0BE)

[AI Art 모델인 Stable Diffusion을 쉽고 편리하게 이용하기](https://github.com/kyopark2014/stable-diffusion-api-server)

[How TO - CSS Loader](https://www.w3schools.com/howto/howto_css_loader.asp)

[Stable Diffusion 1 vs 2 - What you need to know](https://www.assemblyai.com/blog/stable-diffusion-1-vs-2-what-you-need-to-know/)

[How to generate stunning images using Stable Diffusion](https://babich.biz/how-to-use-stable-diffusion/)
