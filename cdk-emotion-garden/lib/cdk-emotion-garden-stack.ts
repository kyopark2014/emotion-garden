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
import * as logs from "aws-cdk-lib/aws-logs"
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as personalize from 'aws-cdk-lib/aws-personalize';

const debug = false;
const stage = "dev";
const endpoints = [
  "emotion-garden-model-2",
]
const nproc = 1;
const cloudFrontDomain = "d3ic6ryvcaoqdy.cloudfront.net";

export class CdkEmotionGardenStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SQS - Bulk
    const queueBulk = new sqs.Queue(this, 'QueueBulk', {
      visibilityTimeout: cdk.Duration.seconds(310),
      queueName: "queue-emotion-garden.fifo",
      fifo: true,
      contentBasedDeduplication: false,
      deliveryDelay: cdk.Duration.millis(0),
      retentionPeriod: cdk.Duration.days(2),
    });
    if (debug) {
      new cdk.CfnOutput(this, 'sqsBulkUrl', {
        value: queueBulk.queueUrl,
        description: 'The url of the Queue',
      });
    }

    // DynamoDB
    const tableName = 'db-emotion-garden';
    const dataTable = new dynamodb.Table(this, 'dynamodb-businfo', {
      tableName: tableName,
      partitionKey: { name: 'ObjKey', type: dynamodb.AttributeType.STRING },
      //sortKey: { name: 'Timestamp', type: dynamodb.AttributeType.STRING }, // no need
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const indexName = 'Emotion-index';
    dataTable.addGlobalSecondaryIndex({ // GSI
      indexName: indexName,
      partitionKey: { name: 'Emotion', type: dynamodb.AttributeType.STRING },
    });

    // personalize
    const datasetGroup = new personalize.CfnDatasetGroup(this, 'DatasetGroup', {
      name: 'emotion-garden-dataset',
    });

    const interactionSchemaJson = `{
      "type": "record",
      "name": "Interactions",
      "namespace": "com.amazonaws.personalize.schema",
      "fields": [
        {
          "name": "USER_ID",
          "type": "string"
        },
        {
          "name": "ITEM_ID",
          "type": "string"
        },
        {
          "name": "TIMESTAMP",
          "type": "long"
        },
        { 
          "name": "EVENT_TYPE",
          "type": "string"
        },
        {
          "name": "IMPRESSION",
          "type": "string"
        }
      ],
      "version": "1.0"
    }`;
    const interactionSchema = new personalize.CfnSchema(this, 'InteractionSchema', {
      name: 'emotion-garden-interaction-schema',
      schema: interactionSchemaJson,
    });

    const interactionDataset = new personalize.CfnDataset(this, 'InteractionDataset', {
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      datasetType: 'Interactions',
      name: 'emotion-garden-interaction-dataset',
      schemaArn: interactionSchema.attrSchemaArn,    
    });
    
    const userSchemaJson = `{
      "type": "record",
      "name": "Users",
      "namespace": "com.amazonaws.personalize.schema",
      "fields": [
        {
          "name": "USER_ID",
          "type": "string"
        },
        {
          "name": "GENERATION",
          "type": "string",
          "categorical": true
        },
        {
          "name": "GENDER",
          "type": "string",
          "categorical": true
        },
        {
          "name": "EMOTION",
          "type": "string",
          "categorical": true
        }
      ],
      "version": "1.0"
    }`;
    const userSchema = new personalize.CfnSchema(this, 'UserSchema', {
      name: 'emotion-garden-user-schema',
      schema: userSchemaJson,
    });

    const userDataset = new personalize.CfnDataset(this, 'UserDataset', {
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      datasetType: 'Users',
      name: 'emotion-garden-user-dataset',
      schemaArn: userSchema.attrSchemaArn,    
    });

    const itemSchemaJson = `{
      "type": "record",
      "name": "Items",
      "namespace": "com.amazonaws.personalize.schema",
      "fields": [
        {
          "name": "ITEM_ID",
          "type": "string"
        },
        {
          "name": "TIMESTAMP",
          "type": "long"
        },
        {
          "name": "EMOTION",
          "type": "string",
          "categorical": true
        }
      ],
      "version": "1.0"
    }`;
    const itemSchema = new personalize.CfnSchema(this, 'ItemSchema', {
      name: 'emotion-garden-itemSchema',
      schema: itemSchemaJson,
    });

    const itemDataset = new personalize.CfnDataset(this, 'ItemDataset', {
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      datasetType: 'Items',
      name: 'emotion-garden-itemDataset',
      schemaArn: itemSchema.attrSchemaArn,    
    }); 

    // s3 
    const s3Bucket = new s3.Bucket(this, "emotion-garden-storage", {
      bucketName: "demo-emotion-garden",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // removalPolicy: cdk.RemovalPolicy.DESTROY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // autoDeleteObjects: true,
      autoDeleteObjects: false,
      publicReadAccess: false,
      versioned: false,
    });
    if (debug) {
      new cdk.CfnOutput(this, 'bucketName', {
        value: s3Bucket.bucketName,
        description: 'The nmae of bucket',
      });
      new cdk.CfnOutput(this, 's3Arn', {
        value: s3Bucket.bucketArn,
        description: 'The arn of s3',
      });
      new cdk.CfnOutput(this, 's3Path', {
        value: 's3://' + s3Bucket.bucketName,
        description: 'The path of s3',
      });
    }

    // copy web application files into s3 bucket
  /*  new s3Deploy.BucketDeployment(this, "upload-HTML-stable-diffusion", {
      sources: [s3Deploy.Source.asset("../html")],
      destinationBucket: s3Bucket,
    }); */

    // cloudfront
    const distribution = new cloudFront.Distribution(this, 'cloudfront-emotion-garden', {
      defaultBehavior: {
        origin: new origins.S3Origin(s3Bucket),
      //  originRequestPolicy: customOriginRequestPolicy,
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
    const lambdaText2Image = new lambda.Function(this, 'lambda-stable-diffusion', {
      description: 'lambda for stable diffusion',
      functionName: 'lambda-stable-diffusion',
      handler: 'lambda_function.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-stable-diffusion')),
      timeout: cdk.Duration.seconds(120),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        bucket: s3Bucket.bucketName,
        endpoints: JSON.stringify(endpoints),
        //domain: distribution.domainName
        domain: cloudFrontDomain,
        nproc: String(nproc)
      }
    });

    s3Bucket.grantReadWrite(lambdaText2Image); // permission for s3
    const SageMakerPolicy = new iam.PolicyStatement({  // policy statement for sagemaker
      actions: ['sagemaker:*'],
      resources: ['*'],
    });
    lambdaText2Image.role?.attachInlinePolicy( // add sagemaker policy
      new iam.Policy(this, 'sagemaker-policy', {
        statements: [SageMakerPolicy],
      }),
    );
    // permission for api Gateway
    lambdaText2Image.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

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
      binaryMediaTypes: ['*/*'],
      deployOptions: {
        stageName: stage,

        // logging for debug
        loggingLevel: apiGateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    });

    // POST method
    const text2image = api.root.addResource('text2image');
    text2image.addMethod('POST', new apiGateway.LambdaIntegration(lambdaText2Image, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }],
      proxy: false,
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
      value: "curl -X POST " + api.url + 'text2image -H "Content-Type: application/json" -d \'{"text":"astronaut on a horse"}\'',
      description: 'Curl commend of API Gateway',
    });

    // cloudfront setting for api gateway of stable diffusion
    distribution.addBehavior("/text2image", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    new cdk.CfnOutput(this, 'StableDiffusionWebUrl', {
      value: 'https://' + distribution.domainName + '/text2image.html',
      description: 'The web url for text2image',
    });

    // Lambda - emotion
    const lambdaEmotion = new lambda.Function(this, "lambdaEmotion", {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-emotion",
      code: lambda.Code.fromAsset("../lambda-emotion"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        bucketName: s3Bucket.bucketName,
        datasetArn: userDataset.attrDatasetArn
      }
    });
    s3Bucket.grantReadWrite(lambdaEmotion);

    const RekognitionPolicy = new iam.PolicyStatement({
      actions: ['rekognition:*'],
      resources: ['*'],
    });
    lambdaEmotion.role?.attachInlinePolicy(
      new iam.Policy(this, 'rekognition-policy', {
        statements: [RekognitionPolicy],
      }),
    );

    // POST method
    const resourceName = "emotion";
    const emotion = api.root.addResource(resourceName);
    emotion.addMethod('POST', new apiGateway.LambdaIntegration(lambdaEmotion, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }],
      proxy: true,
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          },
        }
      ]
    });

    // cloudfront setting for api gateway of emotion
    distribution.addBehavior("/emotion", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    }); 

    new cdk.CfnOutput(this, 'EmotionWebUrl', {
      value: 'https://' + distribution.domainName + '/emotion.html',
      description: 'The web url of emotion',
    });

    // Lambda - bulk
    const lambdaBulk = new lambda.Function(this, "lambdaBulk", {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-bulk",
      code: lambda.Code.fromAsset("../lambda-bulk"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        sqsBulkUrl: queueBulk.queueUrl,
      }
    });
    queueBulk.grantSendMessages(lambdaBulk);
    // permission for api Gateway
    lambdaBulk.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

    // POST method
    const bulk = api.root.addResource('bulk');
    bulk.addMethod('POST', new apiGateway.LambdaIntegration(lambdaBulk, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }],
      proxy: true,
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          },
        }
      ]
    });

    // cloudfront setting for api gateway of bulk
    distribution.addBehavior("/bulk", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    // Lambda for bulk-stable-diffusion
    const lambdaBulkStableDiffusion = new lambda.Function(this, 'lambda-bulk-stable-diffusion', {
      description: 'lambda for bulk emotion',
      functionName: 'lambda-bulk-stable-diffusion',
      handler: 'lambda_function.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-bulk-stable-diffusion')),
      timeout: cdk.Duration.seconds(300),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        bucket: s3Bucket.bucketName,
        endpoints: JSON.stringify(endpoints),
        sqsBulkUrl: queueBulk.queueUrl,
      }
    });
    lambdaBulkStableDiffusion.addEventSource(new SqsEventSource(queueBulk));
    s3Bucket.grantReadWrite(lambdaBulkStableDiffusion); // permission for s3
    lambdaBulkStableDiffusion.role?.attachInlinePolicy( // add sagemaker policy
      new iam.Policy(this, 'sagemaker-policy-for-bulk', {
        statements: [SageMakerPolicy],
      }),
    );

    // Lambda for s3 trigger
    const lambdaS3event = new lambda.Function(this, 'lambda-S3-event', {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-s3-event",
      code: lambda.Code.fromAsset("../lambda-s3-event"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        tableName: tableName
      }
    });
    s3Bucket.grantReadWrite(lambdaS3event); // permission for s3
    dataTable.grantReadWriteData(lambdaS3event); // permission for dynamo

    // s3 put/delete event source
    const s3PutEventSource = new lambdaEventSources.S3EventSource(s3Bucket, {
      events: [
        s3.EventType.OBJECT_CREATED_PUT,
        s3.EventType.OBJECT_REMOVED_DELETE
      ],
      filters: [
        { prefix: 'emotions/' },
      ]
    });
    lambdaS3event.addEventSource(s3PutEventSource);

    // Lambda for garden
    const lambdaGarden = new lambda.Function(this, 'lambda-garden', {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-garden",
      code: lambda.Code.fromAsset("../lambda-garden"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        tableName: tableName,
        indexName: indexName,
        domainName: cloudFrontDomain,
      }
    });
    dataTable.grantReadWriteData(lambdaGarden); // permission for dynamo 

    // POST method
    const garden = api.root.addResource('garden');
    garden.addMethod('POST', new apiGateway.LambdaIntegration(lambdaGarden, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }],
      proxy: true,
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          },
        }
      ]
    });

    // cloudfront setting for api gateway of garden
    distribution.addBehavior("/garden", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    new cdk.CfnOutput(this, 'GardenWebUrl', {
      value: 'https://' + distribution.domainName + '/garden.html',
      description: 'The web url of garden',
    });

    // Lambda for bulk-stable-diffusion
    const lambdaRemove = new lambda.Function(this, 'lambda-remove', {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-remove",
      code: lambda.Code.fromAsset("../lambda-remove"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        bucketName: s3Bucket.bucketName,
      }
    });
    s3Bucket.grantReadWrite(lambdaRemove); // permission for s3    

    // POST method
    const remove = api.root.addResource('remove');
    remove.addMethod('POST', new apiGateway.LambdaIntegration(lambdaRemove, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }],
      proxy: true,
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          },
        }
      ]
    });

    // cloudfront setting for api gateway of remove
    distribution.addBehavior("/remove", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    // Lambda for clear-dynamo-index
    const lambdaClearDynamoIndex = new lambda.Function(this, 'lambda-clear-dynamo-index', {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-clear-dynamo-index",
      code: lambda.Code.fromAsset("../lambda-clear-dynamo-index"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        tableName: tableName,
      }
    });
    dataTable.grantReadWriteData(lambdaClearDynamoIndex); // permission for dynamo 

    // POST method
    const clearIndex = api.root.addResource('clearIndex');
    clearIndex.addMethod('POST', new apiGateway.LambdaIntegration(lambdaClearDynamoIndex, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }],
      proxy: true,
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          },
        }
      ]
    });

    // cloudfront setting for api gateway of clearIndex
    distribution.addBehavior("/clearIndex", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    new cdk.CfnOutput(this, 'UpdateCommend', {
      value: 'aws s3 cp ../html/ ' + 's3://' + s3Bucket.bucketName + '/html --recursive',
      description: 'copy commend for web pages',
    });

    // Lambda - emotion
    const lambdaLike = new lambda.Function(this, "lambdaLike", {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-like",
      code: lambda.Code.fromAsset("../lambda-like"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
      }
    });

    // POST method
    const resourceLike = api.root.addResource('like');
    resourceLike.addMethod('POST', new apiGateway.LambdaIntegration(lambdaLike, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }],
      proxy: true,
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          },
        }
      ]
    });

    // cloudfront setting for api gateway of clearIndex
    distribution.addBehavior("/like", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    


  }
}

