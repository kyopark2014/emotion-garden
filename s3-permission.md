# Personalize의 S3 Permission 설정

## IAM Role 생성

![noname](https://user-images.githubusercontent.com/52392004/235329185-830968fc-a610-4a5d-9f81-135484e866bd.png)

### S3의 퍼미션 

Personalize에서 S3에 대한 퍼미션을 추가하여야 할 경우에 아래와 같이 수행합니다. CDK 사용시에는 별도로 설정하지 않아도 됩니다.

[S3 console](https://s3.console.aws.amazon.com/s3/buckets?region=ap-northeast-1&region=ap-northeast-1)로 진입한 후에, 데모에 사용되는 bucket인 "demo-emotion-garden"을 선택합니다. 

이후 [Permission]메뉴에서 [Bucket policy]를 선택후 아래와 같이 수정합니다. 현재 해당 Bucket은 CloudFront의 Origin의 역할을 하고 있어서, Principle에 CloudFront가 추가되어 있지만, CloudFront를 사용하지 않을 경우에는 S3에 대한 Priciple, Action, Resouces를 추가하면 됩니다.


```java
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "personalize.amazonaws.com",
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E2X1ZWYFLCLC5X"
            },
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::cdkimagerecommenderstack-imagerecommenderstorageb-1t32yos4phxfc",
                "arn:aws:s3:::cdkimagerecommenderstack-imagerecommenderstorageb-1t32yos4phxfc/*"
            ]
        }
    ]
}
```

