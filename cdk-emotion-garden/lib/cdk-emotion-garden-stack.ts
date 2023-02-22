import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudFront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";

const debug = false;
const stage = "dev"; 
const endpoints = [
  "jumpstart-example-infer-model-txt2img-s-2023-02-22-08-48-06-775",
  "jumpstart-example-infer-model-txt2img-s-2023-02-10-11-24-04-069"
]
const nproc = 2;

export class CdkEmotionGardenStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // s3 
    const s3Bucket = new s3.Bucket(this, "emotion-garden-storage",{
      // bucketName: bucketName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      versioned: false,
    });
    if(debug) {
      new cdk.CfnOutput(this, 'bucketName', {
        value: s3Bucket.bucketName,
        description: 'The nmae of bucket',
      });
      new cdk.CfnOutput(this, 's3Arn', {
        value: s3Bucket.bucketArn,
        description: 'The arn of s3',
      });
      new cdk.CfnOutput(this, 's3Path', {
        value: 's3://'+s3Bucket.bucketName,
        description: 'The path of s3',
      });
    }

    // copy web application files into s3 bucket
    new s3Deploy.BucketDeployment(this, "upload-HTML-stable-diffusion", {
      sources: [s3Deploy.Source.asset("../html")],
      destinationBucket: s3Bucket,
    });

    // cloudfront
    const distribution = new cloudFront.Distribution(this, 'cloudfront-emotion-garden', {
      defaultBehavior: {
        origin: new origins.S3Origin(s3Bucket),
        allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      priceClass: cloudFront.PriceClass.PRICE_CLASS_200,  
    });

    new cdk.CfnOutput(this, 'distributionDomainName-emotion-garden', {
      value: distribution.domainName,
      description: 'The domain name of the Distribution',
    }); 

    // Lambda for stable diffusion 
    const mlLambda = new lambda.Function(this, 'lambda-emotion-garden', {
      description: 'lambda for stable diffusion',
      functionName: 'lambda-emotion-garden',
      handler: 'lambda_function.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      timeout: cdk.Duration.seconds(120),
      environment: {
        bucket: s3Bucket.bucketName,
        endpoints: JSON.stringify(endpoints),
        //domain: distribution.domainName
        domain: "d1a0soheyg076e.cloudfront.net",
        nproc: String(nproc)
      }
    });     

    s3Bucket.grantReadWrite(mlLambda); // permission for s3
    const SageMakerPolicy = new iam.PolicyStatement({  // policy statement for sagemaker
      actions: ['sagemaker:*'],
      resources: ['*'],
    });    
    mlLambda.role?.attachInlinePolicy( // add sagemaker policy
      new iam.Policy(this, 'sagemaker-policy', {
        statements: [SageMakerPolicy],
      }),
    );
    // permission for api Gateway
    mlLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    
    // role
    const role = new iam.Role(this, "api-role-emotion-garden", {
      roleName: "api-role-emotion-garden",
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com")
    });
    role.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    }));
    role.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AWSLambdaExecute',
    }); 
    
    // API Gateway
    const api = new apiGateway.RestApi(this, 'api-emotion-garden', {
      description: 'API Gateway for emotion garden',
      endpointTypes: [apiGateway.EndpointType.REGIONAL],
      deployOptions: {
        stageName: stage,

        // logging for debug
        loggingLevel: apiGateway.MethodLoggingLevel.INFO, 
        dataTraceEnabled: true,
      },
    });  

    // POST method
    const text2image = api.root.addResource('text2image');
    text2image.addMethod('POST', new apiGateway.LambdaIntegration(mlLambda, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }], 
      proxy:false, 
    }), {
      methodResponses: [   // API Gateway sends to the client that called a method.
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          }, 
        }
      ]
    }); 

    new cdk.CfnOutput(this, 'apiUrl-emotion-garden', {
      value: api.url,
      description: 'The url of API Gateway',
    }); 
    new cdk.CfnOutput(this, 'curlUrl-emotion-gardenl', {
      value: "curl -X POST "+api.url+'text2image -H "Content-Type: application/json" -d \'{"text":"astronaut on a horse"}\'',
      description: 'Curl commend of API Gateway',
    }); 

    // cloudfront setting for api gateway    
    distribution.addBehavior("/text2image", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,  
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });    

    new cdk.CfnOutput(this, 'WebUrl', {
      value: 'https://'+distribution.domainName+'/text2image.html',      
      description: 'The web url of request for text2image',
    });

    new cdk.CfnOutput(this, 'UpdateCommend', {
      value: 'aws s3 cp ../html/text2image.html '+'s3://'+s3Bucket.bucketName,
      description: 'The url of file upload',
    });
  }
}