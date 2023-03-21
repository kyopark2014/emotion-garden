# Stable Diffusion 이미지 생성하기

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

