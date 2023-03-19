const cloudfrntUrl = "https://d3ic6ryvcaoqdy.cloudfront.net/";

const removeUrl = cloudfrntUrl+"remove";
const retrieveUrl = cloudfrntUrl+"retrieve";

let profileInfo_emotion = document.getElementById('status');
profileInfo_emotion.innerHTML = `<h3>Ready</h3>`;

function retrieveFile(emotionStr) {    
    const xhr = new XMLHttpRequest();

    xhr.open("POST", retrieveUrl, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("--> responseText: " + xhr.responseText);

            let response = JSON.parse(xhr.responseText)
            console.log("response: " + response.text);                    
        }
    };

    let requestObj = {
        "emotion": JSON.stringify(emotionStr),
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

function deleteFile(objName) {    
    const xhr = new XMLHttpRequest();

    xhr.open("POST", removeUrl, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("--> responseText: " + xhr.responseText);

            // let response = JSON.parse(xhr.responseText)
            // console.log("response: " + response.text);                    
        }
    };

    let requestObj = {
        "objName": JSON.stringify(objName),
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

let form = document.forms.input_row3;
let nRow;
let fname;
let likeList = [];
let deletedList = [];
let fileList = [];

form.elements.retrieve.onclick = function () {
    nRow = document.forms.input_row3.elements.nRow.value;
    console.log("nRow: " + nRow);

    for (let i=0;i<nRow;i++) {
        likeList[i] = true;
        deletedList[i] = false;
        fileList[i] = "";
    }

    let selectedEmotion = document.getElementById("emoitonId");
    console.log("emotion: " + selectedEmotion.value);

    let favorite = document.forms.input_row2.elements.favorite.value;
    console.log("favorite: " + favorite);
    favorite = favorite.toLowerCase();

    let emotionStr;
    if(favorite) {
        emotionStr = selectedEmotion.value+'/'+favorite;
    }
    else {
        emotionStr = selectedEmotion.value;
    }
    
    retrieveFile(emotionStr);            

    //alert("이미지 생성이 요청되었습니다. 이미지 한장당 22초가 소요됩니다. 전체 생성 예상 시간은 "+(22*repeatCount*2)+"초 입니다. 이후에 [Update] 버튼을 선택하면 생성된 이미지를 볼 수 있습니다.");    
};

//repeatCount=10;
//fname="emotions/happy/cat/img_20230319-131015"
let like = true;
let previewlist = [];

form.elements.remove.onclick = function () {    
    console.log("nRow: " + nRow);

    let dislike = [];
    for (let i=0;i<nRow;i++) {
        if(!likeList[i] && !deletedList[i]) {            
            console.log(`${cloudfrntUrl+fileList[i]} will be removed.`);

            dislike.push(fileList[i]);

            previewlist[i].innerHTML = '';

            deletedList[i] = true;
        }
    }

    // delete dislike files
    deleteFile(dislike);

    let message = "";
    for(let i in dislike) {
        message += dislike[i]+'\n';
    }
    alert("dislike로 설정한 이미지가 삭제되었습니다. 삭제된 이미지는 아래와 같습니다.\n"+message); 
}

function likeOrDislike(x) {
    if(x.classList.value == "fa fa-thumbs-up fa-thumbs-down") {
        console.log('like!');
        like = true;
    }
    else    {
        console.log('dislike!');
        like = false;
    }

    x.classList.toggle("fa-thumbs-down");           
}

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) { }
}
