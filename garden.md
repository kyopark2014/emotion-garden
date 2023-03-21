# Garden API

Emotion으로 생성한 이미지를 조회하는 API입니다. 

이미지 조회를 위한 API의 리소스 이름은 /garden 이고, HTTPS POST Method로 요청을 수행합니다.

```java
https://d3ic6ryvcaoqdy.cloudfront.net/garden
```

이때 전달하는 값은 "emotion", "generation", "gender"입니다. 

```java
{
    "emotion": "calm",
    "generation": "adult",
    "gender": "Male"
}
```

javascript로 API를 호출하고, landscape와 portrait를 구분하는 예제는 아래와 같습니다.  

```java
const uri = "https://d3ic6ryvcaoqdy.cloudfront.net/garden";
const xhr = new XMLHttpRequest();

xhr.open("POST", uri, true);
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let response = JSON.parse(xhr.responseText)
        let landscape = response['landscape'];
        console.log("landscape: " + landscape);
        let portrait = response['portrait'];
        console.log("portrait: " + portrait);
    }
};

let requestObj = {
    "emotion": emotionValue,
    "generation": generation,
    "gender": gender,
};

let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

xhr.send(blob);
```

API로 호출로 얻은 결과는 아래와 같습니다.

```java
{
   "landscape":[
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230321-135241_0h.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-121242_5h.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-121242_6h.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-121242_3h.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-00504_2h.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230321-135241_7h.jpeg"
   ],
   "portrait":[
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-121242_8v.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230321-135241_2v.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-121242_9v.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230321-135241_7v.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-121242_1v.jpeg",
      "https://d3ic6ryvcaoqdy.cloudfront.net/emotions/calm/img_20230320-00504_5v.jpeg"
   ]
}
```

