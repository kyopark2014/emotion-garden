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
        "width": 1024,
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

    receiptHandle = event['Records'][0]['receiptHandle']
    print("receiptHandle: ", receiptHandle)

    body = event['Records'][0]['body']
    print("body: ", body)

    jsonbody = json.loads(body)

    txt = jsonbody.get("text")
    print("text: ", txt)
    emotion = jsonbody.get("emotion")
    print("emotion: ", emotion)

    endpoints = json.loads(os.environ.get('endpoints'))
    print("endpoints: ", endpoints)
    
    mybucket = os.environ.get('bucket')
    print("bucket: ", mybucket)

    fname = emotion+'/img_'+time.strftime("%Y%m%d-%H%M%S")
    print('fname: ', fname)

    stable_diffusion(txt, mybucket, fname, endpoints[0])

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
