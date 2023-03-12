//DOM
const startButton =document.querySelector(".start-button");
const previewButton =document.querySelector(".preview-button");
const downloadButton =document.querySelector(".download-button");
const emotionButton =document.querySelector(".emotion-button");

const previewPlayer = document.querySelector("#preview");
let canvas = document.getElementById('canvas');     

canvas.width = 500;
canvas.height = 376;
console.log('width: ', canvas.width);
console.log('height:', canvas.height);

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
          console.log(downloadButton.href);
  
          downloadButton.href=img.src;
          downloadButton.download =`capture_${new Date()}.jpeg`;
    },'image/png');
}

function emotion() {
    const uri = "https://d3ic6ryvcaoqdy.cloudfront.net/emotion";
    const xhr = new XMLHttpRequest();

    xhr.open("POST", uri, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert(xhr.responseText); // handle response.
        }
    };

    canvas.toBlob(function(blob){
        xhr.send(blob);
    });
}

//event
startButton.addEventListener("click",videoStart);
previewButton.addEventListener("click",preview);
emotionButton.addEventListener("click",emotion);
