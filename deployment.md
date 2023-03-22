# Emotion Garden 배포 방법

## Cloud9 생성 

여기서는 Tokyo Resion에서 인프라를 구축합니다. [Cloud9 Console](https://ap-northeast-1.console.aws.amazon.com/cloud9control/home?region=ap-northeast-1#/)에 접속하여 [Create environment]를 선택하여 이름으로 "Emotion Garden"을 지정하고, EC2 instance는 편의상 "m5.large"를 선택합니다. 나머지는 기본값을 유지하고, 하단으로 스크롤하여 [Create]를 선택합니다.

![noname](https://user-images.githubusercontent.com/52392004/226772045-160e70c1-ad24-4ea5-be97-2a5101392870.png)




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
