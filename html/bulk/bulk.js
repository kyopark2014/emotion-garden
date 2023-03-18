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
    if(hourstr<10) hourtr = '0'+ hour;
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

const status = "Ready";
let profileInfo_emotion = document.getElementById('status');
profileInfo_emotion.innerHTML = `<h3>${status}</h3>`

function sendFile(prompt, fname, index) {
    const uri = "https://d3ic6ryvcaoqdy.cloudfront.net/bulk";
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
    }
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

let form = document.forms.input_row3;
form.elements.button.onclick = function () {
    let repeatCount = document.forms.input_row0.elements.repeatCount.value;
    console.log("repeatCount: " + repeatCount);

    let selectedEmotion = document.getElementById("emoitonId");
    console.log("emotion: " + selectedEmotion.value);

    let favorite = document.forms.input_row2.elements.favorite.value;
    console.log("favorite: " + favorite);
    favorite = toLowerCase(favorite);

    let others = document.forms.input_row3.elements.others.value;
    console.log("others: " + others);

    const timestr = gettimestr();
    console.log("timestr: ", timestr);

    let fname;
    if(favorite)
        fname = 'emotions/'+selectedEmotion.value+'/'+favorite+'/img_'+timestr;
    else 
        fname = 'emotions/'+selectedEmotion.value+'/img_'+timestr; 

    let prompt = {
        "emotion": selectedEmotion.value,
        "favorite": favorite,
        "others": others
    }
    console.log("prompt: " + JSON.stringify(prompt));
    
    if (prompt) {
        for (let i = 0; i < repeatCount; i++) {
            profileInfo_emotion.innerHTML = `<h3>${i+1}/${repeatCount}</h3>`

            sendFile(prompt, fname, i);
            
            //sleep(1000);            
        }
    } else {
        alert("No prompt.");
    }
};
