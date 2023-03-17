//DOM
const recordButton =document.querySelector(".record-button");
const stopButton =document.querySelector(".stop-button");
const playButton =document.querySelector(".play-button");
const downloadButton =document.querySelector(".download-button");
const previewPlayer = document.querySelector("#preview");
const recordingPlayer = document.querySelector("#recording");

let recorder;
let recordedChunks;

//functions
function videoStart() {
    navigator.mediaDevices.getUserMedia({ video:true,audio:false })
    .then(stream => {
        previewPlayer.srcObject = stream;
        //startRecording(previewPlayer.captureStream())
    })
}

function startRecording(stream) {
    startCapture();
    
    //recordedChunks=[];
    //recorder = new MediaRecorder(stream);
    //recorder.ondataavailable = (e)=>{ recordedChunks.push(e.data) }
    //recorder.start();
}

function captureScreen(stream) {
    recordedChunks=[];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e)=>{ recordedChunks.push(e.data) }
    recorder.start();
}

function stopRecording() {
    startCapture();
    previewPlayer.srcObject.getTracks().forEach(track => track.stop());
    recorder.stop(); 
}

function startCapture(displayMediaOptions) {
    return navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
       .catch((err) => { console.error(`Error:${err}`); return null; });
   }
   
function playRecording() {
    startCapture();
    /*const recordedBlob = new Blob(recordedChunks, {type:"video/webm"});
    recordingPlayer.src=URL.createObjectURL(recordedBlob);
    recordingPlayer.play();
    downloadButton.href=recordingPlayer.src;
    downloadButton.download =`recording_${new Date()}.webm`;
    console.log(recordingPlayer.src); */
}

//event
recordButton.addEventListener("click",videoStart);
stopButton.addEventListener("click",stopRecording);
playButton.addEventListener("click",playRecording);