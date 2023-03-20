const cloudfrntUrl = "https://d3ic6ryvcaoqdy.cloudfront.net/";
const retrieveUrl = cloudfrntUrl + "retrieve";
const text2imagUrl = cloudfrntUrl + "text2imag";

//DOM
const startButton =document.querySelector(".start-button");
const previewButton =document.querySelector(".preview-button");
const downloadButton =document.querySelector(".download-button");
const emotionButton =document.querySelector(".emotion-button");

const previewPlayer = document.querySelector("#preview");
let canvas = document.getElementById('canvas');     

canvas.width = previewPlayer.width;
canvas.height = previewPlayer.height;

let profileInfo_emotion, profileInfo_age, profileInfo_features;
profileInfo_emotion = document.getElementById('profile-emotion');
profileInfo_age = document.getElementById('profile-age');
profileInfo_features = document.getElementById('profile-features');
promptText = document.getElementById('promptText');

let previewUrl = [];
let previewlist = [];
let fileList = [];
const maxImgItems = 100;
const start = 0;

for (let i=0;i<maxImgItems;i++) {
    previewlist.push(document.getElementById('preview'+i));
    
    // add listener        
    (function(index) {
        previewlist[index].addEventListener("click", function() {
            i = index;
            
            console.log('click! index: '+index);
        })
    })(i); 
}

//functions
function videoStart() {
    navigator.mediaDevices.getUserMedia({ video:true,audio:false })
    .then(stream => {
        previewPlayer.srcObject = stream;
    })
}

function preview() {
    canvas.getContext('2d').drawImage(previewPlayer, 0, 0, canvas.width, canvas.height);  

    canvas.toBlob(function(blob){
          const img = new Image();
          img.src = URL.createObjectURL(blob);
  
          console.log(blob);
          
          // downloadButton.href=img.src;
          // console.log(downloadButton.href);
          // downloadButton.download =`capture_${new Date()}.jpeg`;
    },'image/png');    
}

function getEmotion() {
    canvas.getContext('2d').drawImage(previewPlayer, 0, 0, canvas.width, canvas.height);  

    const uri = cloudfrntUrl+"emotion";
    const xhr = new XMLHttpRequest();

    xhr.open("POST", uri, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            console.log("response: " + JSON.stringify(response));

            let gender = response.gender;
            console.log("gender: " + gender);   

            let ageRangeLow = JSON.parse(response.ageRange.Low);
            let ageRangeHigh = JSON.parse(response.ageRange.High);
            let middleAge = (ageRangeLow+ageRangeHigh)/2;
            let ageRange = `Age: ${ageRangeLow} ~ ${ageRangeHigh}`; // age   
            console.log('ages: '+ ageRange); 

            let smile = response.smile;
            console.log("smile: " + smile);   

            let eyeglasses = response.eyeglasses;
            console.log("eyeglasses: " + eyeglasses);   

            let sunglasses = response.sunglasses;
            console.log("sunglasses: " + sunglasses);   

            let beard = response.beard;
            console.log("beard: " + beard);   

            let mustache = response.mustache;
            console.log("mustache: " + mustache);   

            let eyesOpen = response.eyesOpen;
            console.log("eyesOpen: " + eyesOpen);   

            let mouthOpen = response.mouthOpen;
            console.log("mouthOpen: " + mouthOpen);   

            let emotionValue = response.emotions;
            console.log("emotion: " + emotionValue);          
            let emotionText = "Emotion: ";
            if(emotionValue == "HAPPY") emotionText += "행복 (HAPPY)";
            else if(emotionValue == "SURPRISED") emotionText += "놀람 (SURPRISED)";
            else if(emotionValue == "CALM") emotionText += "평온 (CALM)";
            else if(emotionValue == "ANGRY") emotionText += "화남 (ANGRY)";
            else if(emotionValue == "FEAR") emotionText += "공포 (FEAR)";
            else if(emotionValue == "CONFUSED") emotionText += "혼란스러움 (CONFUSED)";
            else if(emotionValue == "DISGUSTED") emotionText += "역겨움 (DISGUSTED)";
            else if(emotionValue == "SAD") emotionText += "슬픔 (SAD)";
            
            let features = "Features:";
            if(smile) features += ' 웃음';
            if(eyeglasses) features += ' 안경';
            if(sunglasses) features += ' 썬글라스';
            if(beard) features += ' 수염';
            if(mustache) features += ' 콧수염';
            if(eyesOpen) features += ' 눈뜨고있음';
            if(mouthOpen) features += ' 입열고있음';
            console.log("features: " + features);   

            let genderText;
            if(gender=='Male') genderText='남자'
            else genderText='여자'            
            let profileText = ageRange+' ('+genderText+')';
            console.log("profileText: " + profileText);   

            profileInfo_emotion.innerHTML = `<h3>${emotionText}</h3>`
            profileInfo_age.innerHTML = `<h3>${profileText}</h3>`
            profileInfo_features.innerHTML = `<h3>${features}</h3>`

            canvas.toBlob(function(blob){
                const img = new Image();
                img.src = URL.createObjectURL(blob);
        
                console.log(blob);
                
                downloadButton.href=img.src;
                console.log(downloadButton.href);
                downloadButton.download =`capture_${emotionValue}_${gender}_${middleAge}_${new Date()}.jpeg`;
            },'image/png');   

            // alert(xhr.responseText); // handle response.

            // getStableDiffusion(emotionValue);
            retrieveFile(emotionValue);
        }
        else {
            profileInfo_emotion.innerHTML = `<h3>No Face</h3>`
            profileInfo_age.innerHTML = ``
            profileInfo_features.innerHTML = ``
        }
    };    

    for (let i=0;i<maxImgItems;i++) {
        previewUrl[i] = "";
        previewlist[i] = "";
        fileList[i] = "";
    }

    canvas.toBlob(function(blob){
        xhr.send(blob);
    });
}

function retrieveFile(emotionStr) {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", retrieveUrl, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("--> responseText: " + xhr.responseText);

            let response = JSON.parse(xhr.responseText)

            for (let i in response) {
                console.log(response[i]);

                previewUrl.push(response[i]);
            }

            console.log('previewUrl length: ', previewUrl.length);
            if (previewUrl.length) {
                for (let i = 0; i < maxImgItems; i++) {
                    if (i + start >= previewUrl.length) break;
                    console.log("previewUrl " + previewUrl[i + start]);

                    let pos = previewUrl[i + start].indexOf('.jpeg');
                    // console.log("pos: ", pos);
                    let identifier = previewUrl[i + start][pos - 1];
                    // console.log("identifier: ", identifier);      

                    let pos2 = previewUrl[i + start].lastIndexOf('emotions');
                    // console.log('pos: ', pos2);
                    fileList[i] = previewUrl[i + start].substring(pos2)
                    console.log("fname: ", fileList[i]);

                    let htmlsrc;
                    if (identifier == 'v') {
                        htmlsrc = `<H5>${previewUrl[i + start]}</H5>
                        <img id="${i}" src="${previewUrl[i + start]}" height="800"/>
                        <i onclick="likeOrDislike(this)" class="fa fa-thumbs-up"></i>`;
                    }
                    else {
                        htmlsrc = `<H5>${previewUrl[i + start]}</H5>
                        <img id="${i}" src="${previewUrl[i + start]}" width="800"/>
                        <i onclick="likeOrDislike(this)" class="fa fa-thumbs-up"></i>`;
                    }
                    console.log('htmlsrc: ', htmlsrc);

                    previewlist[i].innerHTML = htmlsrc;
                }
                profileInfo_emotion.innerHTML = `<h3>Total: ${previewUrl.length}</h3>`;
            }
            else {
                profileInfo_emotion.innerHTML = `<h3>No Image</h3>`;
                previewUrl = [];
                previewlist = [];

                alert("이미지가 조회되지 않습니다.");
            }
        }
    };

    let requestObj = {
        "emotion": emotionStr,
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}


function getStableDiffusion(emotionValue) {
    const uri = cloudfrntUrl+"text2image";
    const xhr = new XMLHttpRequest();

    console.log("start making images...");

    let text = emotionValue+ ', garden, fantasy, concept art, trending on artstation, highly detailed, intricate, sharp focus, digital art';
    console.log('promptText: ', text);

    promptText.innerHTML = `<h3>${text}</h3>`;

    xhr.open("POST", uri, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            console.log("response: " + JSON.stringify(response));
            let result = JSON.parse(response.body);
            console.log("time: " + JSON.parse(response.time));                    

            console.log("result1: " + JSON.stringify(result[0]));
            console.log("result2: " + JSON.stringify(result[1]));
                    
            imgList[0].innerHTML = `<form id="preview_row"></form>
                <img id="previewImg0" width="512" alt="Preview" />
                <img id="previewImg1" width="512" alt="Preview" />
            </form>`

            previewImg0.src = result[0];
            previewImg1.src = result[1];               
        }
    };

    var requestObj = {"text":text}
    console.log("request: " + JSON.stringify(requestObj));

    var blob = new Blob([JSON.stringify(requestObj)], {type: 'application/json'});

    xhr.send(blob);
}

function emotion() {
    getEmotion();    
}

//event
startButton.addEventListener("click",videoStart);
// previewButton.addEventListener("click",preview);
emotionButton.addEventListener("click",emotion);
