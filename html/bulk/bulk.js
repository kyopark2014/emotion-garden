const uri = "https://d3ic6ryvcaoqdy.cloudfront.net/bulk";
const cloudfrntUrl = "https://d3ic6ryvcaoqdy.cloudfront.net/";

let profileInfo_emotion = document.getElementById('status');
profileInfo_emotion.innerHTML = `<h3>Ready</h3>`;

function sendFile(prompt, fname, index) {    
    const xhr = new XMLHttpRequest();

    xhr.open("POST", uri, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("--> responseText: " + xhr.responseText);

            // let response = JSON.parse(xhr.responseText)
            // console.log("response: " + response.text);                    
        }
    };

    let requestObj = {
        "index": index,
        "prompt": JSON.stringify(prompt),
        "fname": fname
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

let form = document.forms.input_row3;
let repeatCount, fname;
form.elements.send.onclick = function () {
    repeatCount = document.forms.input_row0.elements.repeatCount.value;
    console.log("repeatCount: " + repeatCount);

    let selectedEmotion = document.getElementById("emoitonId");
    console.log("emotion: " + selectedEmotion.value);

    let favorite = document.forms.input_row2.elements.favorite.value;
    console.log("favorite: " + favorite);
    favorite = favorite.toLowerCase();

    let others = document.forms.input_row3.elements.others.value;
    console.log("others: " + others);

    const timestr = gettimestr();
    console.log("timestr: ", timestr);
    
    if(favorite)
        fname = 'emotions/'+selectedEmotion.value+'/'+favorite+'/img_'+timestr;
    else 
        fname = 'emotions/'+selectedEmotion.value+'/img_'+timestr; 

    let prompt = {
        "emotion": selectedEmotion.value,
        "favorite": favorite,
        "others": others
    };
    console.log("prompt: " + JSON.stringify(prompt));
    
    if (prompt) {
        for (let i = 0; i < repeatCount; i++) {
            profileInfo_emotion.innerHTML = `<h3>${i+1}/${repeatCount}</h3>`;

            sendFile(prompt, fname, i);            
            //sleep(1000);            
        }
    } else {
        alert("No prompt.");
    }
};

// repeatCount=1;
// fname="emotions/happy/cat/img_20230318-82016"

form.elements.update.onclick = function () {
    var previewlist = [];
    console.log("repeatCount: " + repeatCount);
    console.log("fname: " + fname);
    
    // previews
    for (let i=0;i<repeatCount*2;i++) {
        if(i<repeatCount)
            previewlist.push(document.getElementById('preview'+i+'h'));
        else
            previewlist.push(document.getElementById('preview'+i+'v'));

        // add listener        
        (function(index) {
            previewlist[index].addEventListener("click", function() {
                if(previewlist.length < repeatCount) i = index;
                else i = index + repeatCount;

                console.log('click! index: '+index);
            });
        })(i);
    }    

    let listCnt = 0;
    for(let i=0;i<repeatCount*2;i++) {
        let previewUrl;

        let id;
        if(i<repeatCount) {
            previewUrl = cloudfrntUrl+fname+'_'+i+'h.jpeg';
            id = fname+'_'+i+'h';
        }
        else {
            previewUrl = cloudfrntUrl+fname+'_'+i+'v.jpeg';
            id = fname+'_'+i+'v';
        }
        console.log('previewUrl: ', previewUrl);
        
        const htmlsrc = `<H5>${previewUrl}</H5><img id="${id}" src="${previewUrl}" width="500"/>`;
        console.log('htmlsrc: ', htmlsrc);

        previewlist[i].innerHTML = htmlsrc;
    }    
};

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) { }
}

function gettimestr() {
    let dateObj = new Date();
    let year = dateObj.getUTCFullYear();    
    let month = dateObj.getUTCMonth() + 1; //months from 1-12    
    let monthstr;
    if(month<10) monthstr = '0'+ month;
    else monthstr = month;

    let day = dateObj.getUTCDate();
    let daystr;
    if(daystr<10) daystr = '0'+ day;
    else daystr = day;
    
    let hour = dateObj.getHours();
    let hourstr;
    if(hourstr<10) hourstr = '0'+ hour;
    else hourstr = hour;
    
    let minutes = dateObj.getMinutes();
    let minutesstr;
    if(minutes<10) minutesstr = '0'+ minutes;
    else minutesstr = minutes;
    
    let seconds = dateObj.getSeconds();
    let secondsstr;
    if(seconds<10) secondsstr = '0'+ seconds;
    else secondsstr = seconds;
    
    let timestr = year+monthstr+daystr+'-'+hourstr+minutesstr+secondsstr;
    
    return timestr;
}

