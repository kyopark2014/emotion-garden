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
let msglist = [];
const maxMsgItems = 10;
for (i=0;i<maxMsgItems;i++) {
    profileInfo_emotion = document.getElementById('profile-emotion');
    profileInfo_age = document.getElementById('profile-age');
    profileInfo_features = document.getElementById('profile-features');
    msglist.push(document.getElementById('emotion'+i));

    msglist.push(document.getElementById('emotion'+i));

    // add listener        
    (function(index) {
        msglist[index].addEventListener("click", function() {
            if(msglist.length < maxMsgItems) i = index;
            else i = index + maxMsgItems;

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

function emotion() {
    canvas.getContext('2d').drawImage(previewPlayer, 0, 0, canvas.width, canvas.height);  

    const uri = "https://d3ic6ryvcaoqdy.cloudfront.net/emotion";
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

            let emotion = response.emotions;
            console.log("emotion: " + emotion);          
            let emotionText = "Emotion: ";
            if(emotion == "HAPPY") emotionText += "행복 (HAPPY)";
            else if(emotion == "SURPRISED") emotionText += "놀람 (SURPRISED)";
            else if(emotion == "CALM") emotionText += "평온 (CALM)";
            else if(emotion == "ANGRY") emotionText += "화남 (ANGRY)";
            else if(emotion == "FEAR") emotionText += "공포 (FEAR)";
            else if(emotion == "CONFUSED") emotionText += "혼란스러움 (CONFUSED)";
            else if(emotion == "DISGUSTED") emotionText += "역겨움 (DISGUSTED)";
            else if(emotion == "SAD") emotionText += "슬픔 (SAD)";
            
            let features = "Features:";
            if(smile) features += ' 웃음';
            if(eyeglasses) features += ' 안경';
            if(sunglasses) features += ' 썬글라스';
            if(beard) features += ' 수염';
            if(mustache) features += ' 콧수염';
            if(eyesOpen) features += ' 눈뜨고있음';
            if(mouthOpen) features += ' 입열고있음';
            console.log("features: " + features);   

            let profileText = ageRange+' ('+gender+')';
            console.log("profileText: " + profileText);   

            profileInfo_emotion.innerHTML = `<h3>${emotionText}</h3>`
            profileInfo_age.innerHTML = `<h3>${profileText}</h3>`
            profileInfo_features.innerHTML = `<h3>${features}</h3>`

            // msglist[0].innerHTML = `<h3>${emotions}</h3>`;
            // console.log(msglist[0]);

            // alert(xhr.responseText); // handle response.
        }
    };

    canvas.toBlob(function(blob){
        xhr.send(blob);
    });
}

//event
startButton.addEventListener("click",videoStart);
// previewButton.addEventListener("click",preview);
emotionButton.addEventListener("click",emotion);
