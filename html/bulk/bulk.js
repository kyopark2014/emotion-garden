function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) { }
}

const status = "Ready";
let profileInfo_emotion = document.getElementById('status');
profileInfo_emotion.innerHTML = `<h3>${status}</h3>`

function sendFile(prompt, index) {
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
        "prompt": JSON.stringify(prompt)
    }
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

let form = document.forms.input_row5;
form.elements.button.onclick = function () {
    let repeatCount = document.forms.input_row0.elements.repeatCount.value;
    console.log("repeatCount: " + repeatCount);

    let selectedEmotion = document.getElementById("emoitonId");
    console.log("emotion: " + selectedEmotion.value);

    let feature0 = document.forms.input_row2.elements.feature0.value;
    console.log("feature0: " + feature0);

    let feature1 = document.forms.input_row3.elements.feature1.value;
    console.log("feature1: " + feature1);

    let feature2 = document.forms.input_row4.elements.feature2.value;
    console.log("feature2: " + feature2);

    let others = document.forms.input_row5.elements.others.value;
    console.log("others: " + others);

    let prompt = {
        "emotion": selectedEmotion.value,
        "feature0": feature0,
        "feature1": feature1,
        "feature2": feature2,
        "others": others
    }
    console.log("prompt: " + JSON.stringify(prompt));

    if (prompt) {
        for (let i = 0; i < repeatCount; i++) {
            profileInfo_emotion.innerHTML = `<h3>${i+1}/${repeatCount}</h3>`

            sendFile(prompt, i);
            
            sleep(1000);            
        }
    } else {
        alert("No prompt.");
    }
};
