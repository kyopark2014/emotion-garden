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

    # {'Records': [{'messageId': 'adb04432-65c9-4a16-919a-56a7d68210d9', 'receiptHandle': 'AQEBpx/jIV+zXdPBiY7yfym5G3HEA+kPLmY2ooSt6KOMqRohe6MwbRLKIbaiorFD3xU3/ik6vTs8doXePOdUyzz9FtbOGTAvpvIs/Kiv74b1lbyE/0Y5h7zf83LGPdlLLpFXpKvOwzF61JkrfK5aDezh9Jnqb24reKQPjZbZXtBKsj2H+7iEeT27z92KpJPgn+KcD/ipszGj/zY3cEumwq4HayDnkY6BsMwxjSn6xeQC0swy7neyIcGPqj8C9x/9co2ztHt2Lq3wZnpT3/phRWUpKTLfgEnJK+iQvYoTpkBFXqZ8mnPJu2QZreSGbpnnzUaoancCbdvyGKfIEbxm0kh3Djbknx3v1Rn+ybkoQ3ohcbZalQIotAPw53zezLIglnNlJwQBzMNGjNo7h3HWjxIpj0I8wdtRtzX3EH/YVTree6Y=', 'body': '{"type":"Buffer","data":[123,34,116,101,120,116,34,58,34,65,32,102,108,111,119,101,114,32,119,105,116,104,32,99,97,116,44,32,102,97,110,116,97,115,121,44,32,118,101,114,121,32,104,97,112,112,121,44,32,105,109,109,97,116,117,114,101,44,32,115,109,105,108,101,44,32,99,111,110,99,101,112,116,32,97,114,116,44,32,116,114,101,110,100,105,110,103,32,111,110,32,97,114,116,115,116,97,116,105,111,110,44,32,104,105,103,104,108,121,32,100,101,116,97,105,108,101,100,44,32,105,110,116,114,105,99,97,116,101,44,32,115,104,97,114,112,32,102,111,99,117,115,44,32,100,105,103,105,116,97,108,32,97,114,116,34,125]}', 'attributes': {'ApproximateReceiveCount': '1', 'SentTimestamp': '1678721611760', 'SenderId': 'AROA4URKQRYHL6ASQCBDQ:lambda-bulk', 'ApproximateFirstReceiveTimestamp': '1678721621760'}, 'messageAttributes': {}, 'md5OfBody': 'b90035e9be5ec8e036500e7043530d52', 'eventSource': 'aws:sqs', 'eventSourceARN': 'arn:aws:sqs:ap-northeast-1:868746300942:queue-emotion-garden', 'awsRegion': 'ap-northeast-1'}]}

    # receiptHandle  event['Records'][0]['receiptHandle'];
    # body   JSON.parse();

    receiptHandle = event['Records'][0]['receiptHandle']
    print("receiptHandle: ", receiptHandle)

    body = event['Records'][0]['body']
    data = json.loads(body.data)
    print("data: ", json.dumps(data))

    """
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
        
    elapsed_time = int(time.time()) - start
    print("total run time(sec): ", elapsed_time)
    print("urls: ", urls)
    """

    statusCode = 200     
    return {
        'statusCode': statusCode,
        #'body': json.dumps(urls),
        #'time': elapsed_time
    }
