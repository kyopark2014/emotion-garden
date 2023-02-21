import json
import boto3
import io
import os
import time
import base64
from multiprocessing import Process

s3 = boto3.client('s3')

def parse_response(query_response):    
    response_dict = json.loads(query_response)
    return response_dict["generated_images"], response_dict["prompt"]

urls = []

def stable_diffusion(num, txt, mybucket, endpoint):
    mykey = 'img_'+time.strftime("%Y%m%d-%H%M%S")+'_'+str(num)+'.jpeg'  
    print('key: ', mykey)

    domain = os.environ.get('domain')  
    url = "https://"+domain+'/'+mykey
    print("url: ", url)

    payload = {        
        "prompt": txt,
        "width": 768,
        "height": 512,
        "num_images_per_prompt": 1,
        "num_inference_steps": 50,
        "guidance_scale": 7.5,
    }

    runtime = boto3.Session().client('sagemaker-runtime')
    response = runtime.invoke_endpoint(EndpointName=endpoint, ContentType='application/json', Accept='application/json;jpeg', Body=json.dumps(payload))
    
    statusCode = response['ResponseMetadata']['HTTPStatusCode']
    print('statusCode:', json.dumps(statusCode))
    
    if(statusCode==200):
        response_payload = response['Body'].read().decode('utf-8')
        generated_images, prompt = parse_response(response_payload)

        #print(response_payload)
        #print(generated_images[0])
        print(prompt)
        
        img_str = base64.b64decode(generated_images[0])
        buffer = io.BytesIO(img_str) 

        s3.upload_fileobj(buffer, mybucket, mykey, ExtraArgs={"ContentType": "image/jpeg"})

        urls.push(url)

def lambda_handler(event, context):
    print(event)

    # txt = "astronaut on a horse",        
    txt = event['text']
    print("text: ", txt)

    mybucket = os.environ.get('bucket')
    print("bucket: ", mybucket)

    endpoint = os.environ.get('endpoint')
    print("endpoint: ", endpoint)
            
    start = int(time.time())
                
    procs = []    
    for num in range(1,4): # 3 processes
        print('num:', num)
        proc = Process(target=stable_diffusion, args=(num, txt, mybucket, endpoint,))
        procs.append(proc)
        proc.start()
        
    for proc in procs:
        proc.join()

    print("***run time(sec) :", int(time.time()) - start)

    statusCode = 200     
    return {
        'statusCode': statusCode,
        'body': json.dumps(urls)
    }