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

def stable_diffusion(num, txt, mybucket, fname, endpoint):
    mykey = fname+'_'+str(num)+'.jpeg'  
    start = int(time.time())

    print("endpoint: ", endpoint)

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
        
        print("---> run time(sec): ", int(time.time()) - start)
    
def lambda_handler(event, context):
    print(event)

    endpoints = json.loads(os.environ.get('endpoints'))
    print("endpoints: ", endpoints)

    nproc = int(os.environ.get('nproc'))
    print("nproc: ", nproc)

    txt = event['text']
    print("text: ", txt)

    mybucket = os.environ.get('bucket')
    print("bucket: ", mybucket)

    fname = 'img_'+time.strftime("%Y%m%d-%H%M%S")
    print('fname: ', fname)

    domain = os.environ.get('domain')  
                
    start = int(time.time())
                
    procs = []    
    urls = []
    for num in range(0,nproc): # 2 processes
        print('num:', num)
        proc = Process(target=stable_diffusion, args=(num, txt, mybucket, fname, endpoints[num],))
        urls.append("https://"+domain+'/'+fname+'_'+str(num)+'.jpeg')    
        procs.append(proc)
        proc.start()
        
    for proc in procs:
        proc.join()
        
    print("total run time(sec): ", int(time.time()) - start)
    print("urls: ", urls)

    statusCode = 200     
    return {
        'statusCode': statusCode,
        'body': json.dumps(urls)
    }