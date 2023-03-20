const cloudfrntUrl = "https://d3ic6ryvcaoqdy.cloudfront.net/";

const removeUrl = cloudfrntUrl + "remove";
const retrieveUrl = cloudfrntUrl + "retrieve";
const clearIndexUrl = cloudfrntUrl + "clearIndex";

let profileInfo_emotion = document.getElementById('status');
profileInfo_emotion.innerHTML = `<h3>Ready</h3>`;

let start = 0, nRow = 50;
let previewUrl = [];
let previewlist = [];
let isValid = true;

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
                for (let i = 0; i < nRow; i++) {
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

                    if (!deletedList[i])
                        previewlist[i].innerHTML = htmlsrc;
                }

                alert("이미지 조회를 요청되었습니다.");
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

function removeFile(objName) {   
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
        "objName": objName,
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

function clearIndexDynamoDB(objName) {   
    const xhr = new XMLHttpRequest();

    xhr.open("POST", clearIndexUrl, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("--> responseText: " + xhr.responseText);

            // let response = JSON.parse(xhr.responseText)
            // console.log("response: " + response.text);                               
        }
    };

    let requestObj = {
        "objName": objName,
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

let form = document.forms.input_row3;

let fname;
let likeList = [];
let deletedList = [];
let fileList = [];

form.elements.retrieve.onclick = function () {
    start = document.forms.input_row3.elements.start.value;
    start = start * 1; // string to number
    console.log("start: " + start);
    nRow = document.forms.input_row3.elements.nRow.value;
    console.log("nRow: " + nRow);

    previewUrl = [];
    previewlist = [];

    for (let i = 0; i < nRow; i++) {
        likeList[i] = true;
        deletedList[i] = false;
        fileList[i] = "";

        previewlist.push(document.getElementById('preview' + i));
        // add listener        
        (function (index) {
            previewlist[index].addEventListener("click", function () {
                i = index;

                console.log('click! index: ' + index);

                likeList[i] = like;
                console.log('like: ' + likeList[i] + ' filename: ' + fileList[i]);

                // check validity
                const url = cloudfrntUrl+fileList[i];
                console.log('url: ', url);

                checkFile(url);

                if(!isValid) {
                    console.log('No file, clear index of dynamodb');
                    isValid = true;
                    clearIndexDynamoDB(fileList[i]);
                    deletedList[i] = true;
                    previewlist[i].innerHTML = '';
                }
            });
        })(i);
    }

    let selectedEmotion = document.getElementById("emoitonId");
    console.log("emotion: " + selectedEmotion.value);

    let favorite = document.forms.input_row2.elements.favorite.value;
    console.log("favorite: " + favorite);
    favorite = favorite.toLowerCase();

    let emotionStr;
    if (favorite) {
        emotionStr = selectedEmotion.value + '/' + favorite;
    }
    else {
        emotionStr = selectedEmotion.value;
    }

    retrieveFile(emotionStr);
};

//repeatCount=10;
//fname="emotions/happy/cat/img_20230319-131015"
let like = true;

form.elements.remove.onclick = function () {
    console.log("nRow: " + nRow);

    let dislike = [];
    for (let i = 0; i < nRow; i++) {
        if (!likeList[i] && !deletedList[i]) {
            console.log(`${cloudfrntUrl + fileList[i]} will be removed.`);

            dislike.push(fileList[i]);

            previewlist[i].innerHTML = '';

            deletedList[i] = true;
        }
    }

    // remove dislike files
    removeFile(dislike);

    for(let i in dislike)  // remove dynamodb index
        clearIndexDynamoDB(dislike[i]);

    let message = "";
    for (let i in dislike) {
        message += dislike[i] + '\n';
    }
    alert("dislike로 설정한 이미지가 삭제되었습니다. 삭제된 이미지는 아래와 같습니다.\n" + message);
}

function likeOrDislike(x) {
    if (x.classList.value == "fa fa-thumbs-up fa-thumbs-down") {
        console.log('like!');
        like = true;
    }
    else {
        console.log('dislike!');
        like = false;
    }

    x.classList.toggle("fa-thumbs-down");
}

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) { }
}

function checkFile(url) {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onreadystatechange = () => {
        console.log("xhr.statu: ", xhr.status);

        if(xhr.status === 403){
            isValid = false;
        }
        else {
            isValid = true;
        }
    };

/*    let requestObj = {
        "emotion": JSON.stringify(emotionStr),
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob); */
    xhr.send();
}
