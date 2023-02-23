const aws = require('aws-sdk');
const {v4: uuidv4} = require('uuid');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const bucketName = process.env.bucketName;

exports.handler = async (event, context) => {
    //console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    //console.log('## EVENT: ' + JSON.stringify(event))
    
    const body = Buffer.from(event["body"], "base64");
    // console.log('body: ' + body)
    const header = event['multiValueHeaders'];
    // console.log('header: ' + JSON.stringify(header));
            
    let contentType;
    if(header['Content-Type']) {
        contentType = String(header['Content-Type']);
    } 
    console.log('contentType = '+contentType);     

    const uuid = uuidv4();
    
    let filename = 'profile/'+uuid+'.jpeg';
    console.log('filename = '+filename);
    
    try {
        const destparams = {
            Bucket: bucketName, 
            Key: filename,
            Body: body,
            ContentType: contentType
        };
        
      //  console.log('destparams: ' + JSON.stringify(destparams));
        const {putResult} = await s3.putObject(destparams).promise(); 

        console.log('### finish upload: ' + uuid);
    } catch (error) {
        console.log(error);
        return;
    } 
    
    try {
        const rekognition = new aws.Rekognition();
        const rekognitionParams = {
            Image: {
                S3Object: {
                    Bucket: bucketName,
                    Name: filename
                },
            },
        }
        console.log('rekognitionParams = '+JSON.stringify(rekognitionParams))

        let data = await rekognition.detectFaces(rekognitionParams).promise();
        console.log('data: '+JSON.stringify(data));




    } catch (error) {
        console.log(error);
        return error;
    } 

    const fileInfo = {
        Id: uuid,
        Bucket: bucketName, 
        Key: filename,
    }; 
    console.log('file info: ' + JSON.stringify(fileInfo));
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(fileInfo)
    };
    return response;
};