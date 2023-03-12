//DOM
const startButton =document.querySelector(".start-button");
const previewButton =document.querySelector(".preview-button");
const downloadButton =document.querySelector(".download-button");
const uploadButton =document.querySelector(".upload-button");

const previewPlayer = document.querySelector("#preview");
let canvas = document.getElementById('canvas');     

canvas.width = 500;
canvas.height = 376;
console.log('width: ', canvas.width);
console.log('height:', canvas.height);

//functions
function videoStart() {
    navigator.mediaDevices.getUserMedia({ video:true,audio:true })
    .then(stream => {
        previewPlayer.srcObject = stream;
    })
}

function preview() {
    canvas.getContext('2d').drawImage(previewPlayer, 0, 0, canvas.width, canvas.height);  
}

function playRecording() {
    const recordedBlob = new Blob(recordedChunks, {type:"video/webm"});
    recordingPlayer.src=URL.createObjectURL(recordedBlob);
    recordingPlayer.play();
    //downloadButton.href=recordingPlayer.src;
    //downloadButton.download =`recording_${new Date()}.webm`;
    console.log(recordingPlayer.src); 

    canvas.getContext('2d').drawImage(previewPlayer, 0, 0, canvas.width, canvas.height);  
 /*   canvas.toBlob() = (blob) => {
      const img = new Image();
      img.src = window.URL.createObjectUrl(blob);
    }; */

    

 /*   const imagblob = new Blob(lastrecord, {type:"image/jpeg"});
    recordingPlayer.src=URL.createObjectURL(imagblob);

    const img = new Image();
    img.src = URL.createObjectURL(imagblob);

    downloadButton.href=img.src;
    downloadButton.download =`recording_${new Date()}.jpeg`;
    console.log(img.src); */

    /*recordingPlayer.toBlob() = (blob) => {
        const img = new Image();
        img.src = window.URL.createObjectUrl(blob);

        downloadButton.href=img.src;
        downloadButton.download =`recording_${new Date()}.jpeg`;
        console.log(img.src); 
    }; */

    
}

//event
startButton.addEventListener("click",videoStart);
previewButton.addEventListener("click",preview);
