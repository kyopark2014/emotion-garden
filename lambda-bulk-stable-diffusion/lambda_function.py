import json
import boto3
import io
import os
import time
import base64
from multiprocessing import Process

s3 = boto3.client('s3')
sqs = boto3.client('sqs')
sqsBulkUrl = os.environ.get('sqsBulkUrl')

def parse_response(query_response):    
    response_dict = json.loads(query_response)
    return response_dict["generated_images"], response_dict["prompt"]

def stable_diffusion(txt, mybucket, fname, endpoint):
    mykey = fname+'.jpeg'  
    start = int(time.time())

    print("endpoint: ", endpoint)

    payload = {        
        "prompt": txt,
        "width": 1024,  # WSVGA 1024 x 600, WXGA: 1280 x 800
        "height": 600,
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

    for record in event['Records']:
        print("record: ", record)

        receiptHandle = record['receiptHandle']
        print("receiptHandle: ", receiptHandle)

        body = record['body']
        print("body: ", body)

        jsonbody = json.loads(body)
        index = jsonbody['index']
        print("index: ", index)
        prompt = json.loads(jsonbody['prompt'])
        print("prompt: ", prompt)
        
        emotion = prompt['emotion']
        print("emotion: ", emotion)

        text = emotion
        key = emotion
        if prompt['feature0']:
            text = text + ", "+ prompt['feature0']
            key = key + "/" + prompt['feature0'] 
        if prompt['feature1']:
            text = text + ", "+ prompt['feature1']
            key = key + "/" + prompt['feature1'] 
        if prompt['feature2']:
            text = text + ", "+ prompt['feature2']
            key = key + "/" + prompt['feature2'] 
        text = text + ", "+ prompt['others']
        print("text: ", text)
        key = key + "/" + 'img_'+time.strftime("%Y%m%d-%H%M%S")+'_'+str(index)
        print('key: ', key)

        endpoints = json.loads(os.environ.get('endpoints'))
        print("endpoints: ", endpoints)
        
        mybucket = os.environ.get('bucket')
        print("bucket: ", mybucket)
        
        stable_diffusion(text, mybucket, key, endpoints[0])

        # delete queue
        try:
            sqs.delete_message(QueueUrl=sqsBulkUrl, ReceiptHandle=receiptHandle)
        except Exception as e:        
            print('Fail to delete the queue message: ', e)
            
    statusCode = 200     
    return {
        'statusCode': statusCode,
        'body': fname,
    }
