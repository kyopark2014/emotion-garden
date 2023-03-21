const aws = require('aws-sdk');
const {v4: uuidv4} = require('uuid');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const bucketName = process.env.bucketName;

exports.handler = async (event, context) => {
    console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    console.log('## EVENT: ' + JSON.stringify(event))
    
    const body = Buffer.from(event["body"], "base64");
    // console.log('body: ' + body)
    const header = event['multiValueHeaders'];
    // console.log('header: ' + JSON.stringify(header));
            
    let userId = "";
    if(header['X-user-id']) {
        userId = String(header['X-user-id']);
    } 
    console.log('userId: ', userId);

    let contentType;
    if(header['Content-Type']) {
        contentType = String(header['Content-Type']);
    } 
    console.log('contentType: ', contentType);     

    let uuid = "";
    if(userId)
        uuid = userId;
    else
        uuid = uuidv4();
    
    const fileName = 'profile/'+uuid+'.jpeg';
    console.log('fileName = '+fileName);
    
    try {
        const destparams = {
            Bucket: bucketName, 
            Key: fileName,
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
    
    let response = "";
    try {
        console.log('**start emotion detection');
        const rekognition = new aws.Rekognition();
        const rekognitionParams = {
            Image: {
                S3Object: {
                    Bucket: bucketName,
                    Name: fileName
                },
            },
            Attributes: ['ALL']
        }
        console.log('rekognitionParams = '+JSON.stringify(rekognitionParams))

        const data = await rekognition.detectFaces(rekognitionParams).promise();
        // console.log('data: '+JSON.stringify(data));

        if(data['FaceDetails'][0]) {
            const profile = data['FaceDetails'][0];
    
            const ageRange = profile['AgeRange'];
            // console.log('ageRange: '+JSON.stringify(ageRange));
            const smile = profile['Smile']['Value'];
            // console.log('smile: ', smile);
            const eyeglasses = profile['Eyeglasses']['Value'];
            // console.log('smile: ', smile);
            const sunglasses = profile['Sunglasses']['Value'];
            // console.log('sunglasses: ', sunglasses);
            const gender = profile['Gender']['Value'];
            // console.log('gender: ', gender);
            const beard = profile['Beard']['Value'];
            // console.log('beard: ', beard);
            const mustache = profile['Mustache']['Value'];
            // console.log('mustache: ', mustache);
            const eyesOpen = profile['EyesOpen']['Value'];
            // console.log('eyesOpen: ', eyesOpen);
            const mouthOpen = profile['MouthOpen']['Value'];
            // console.log('mouthOpen: ', mouthOpen);
            const emotions = profile['Emotions'][0]['Type'];
            // console.log('emotions: ', emotions);

            console.log('**finish emotion detection');
            const emotionInfo = {
                Id: uuid,
                Bucket: bucketName, 
                Key: fileName,
                ageRange: ageRange,
                smile: smile,
                eyeglasses: eyeglasses,
                sunglasses: sunglasses,
                gender: gender,
                beard: beard,
                mustache: mustache,
                eyesOpen: eyesOpen,
                mouthOpen: mouthOpen,
                emotions: emotions
            }; 
            console.log('file info: ' + JSON.stringify(emotionInfo));
            
            response = {
                statusCode: 200,
                body: JSON.stringify(emotionInfo)
            };
        }
        else {
            response = {
                statusCode: 404,
                body: "No Face"
            };
        }

    } catch (error) {
        console.log(error);

        response = {
            statusCode: 500,
            body: error
        };
    } 
    
    return response;
};