# Emotion Garden

전체적인 Architecture는 아래와 같습니다. 여기서는 데모의 원할한 진행을 위하여 여러개의 Endpoint를 만들어서 실행속도를 향상합니다. p3 2xlarge로 진행시 endpoint로 진행시 약 50초정도 소요되지만, 2개의 p3 2xlarge로 진행시는 14초 소요됩니다. 

<img width="716" alt="image" src="https://user-images.githubusercontent.com/52392004/220714782-1dc0a2e8-de35-4f53-8ebb-9b2a915a749b.png">

## Facial Analytis

[Facial analysis](https://github.com/kyopark2014/emotion-garden/blob/main/facial-analysis.md)


## Parallel Processing

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


## ETC

- A flower with cat, fantasy, very happy, immature, smile, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art

<img width="1427" alt="image" src="https://user-images.githubusercontent.com/52392004/220819859-0c211084-6feb-4032-a365-b960044942a4.png">


## Reference

[[Python] 병렬처리(Multiprocessing)를 통한 연산속도 개선](https://yganalyst.github.io/data_handling/memo_17_parallel/)

[Running On-Demand P instances](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/ec2/quotas/L-417A185B)

[ml.p3.2xlarge for endpoint usage](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/services/sagemaker/quotas/L-1623D0BE)

[AI Art 모델인 Stable Diffusion을 쉽고 편리하게 이용하기](https://github.com/kyopark2014/stable-diffusion-api-server)

[How TO - CSS Loader](https://www.w3schools.com/howto/howto_css_loader.asp)
