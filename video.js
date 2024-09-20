document.getElementById("ai").addEventListener("change", toggleAi);
document.getElementById("fps").addEventListener("input", changeFps);

const video = document.getElementById("video");
const c1 = document.getElementById('c1');
const ctx1 = c1.getContext('2d');
var cameraAvailable = false;
var aiEnabled = false;
var fps = 16;

/* Setting up the constraint */
var facingMode = "environment"; // Can be 'user' or 'environment' to access back or front camera
var constraints = {
    audio: false,
    video: {
        facingMode: facingMode
    }
};

/* Stream it to video element */
camera();
function camera() {
    if (!cameraAvailable) {
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            cameraAvailable = true;
            video.srcObject = stream;
        }).catch(function (err) {
            cameraAvailable = false;
            if (err.name === "NotAllowedError") {
                document.getElementById("loadingText").innerText = "Camera permission required. Please allow access.";
            } else {
                document.getElementById("loadingText").innerText = "Error accessing the camera.";
            }
            setTimeout(camera, 1000); // Retry after 1 second
        });
    }
}

window.onload = function () {
    changeFps(); // Initialize FPS
    timerCallback(); // Start the loop
}

function timerCallback() {
    if (isReady()) {
        setResolution();
        ctx1.clearRect(0, 0, c1.width, c1.height); // Clear canvas
        ctx1.drawImage(video, 0, 0, c1.width, c1.height); // Draw video on canvas
        if (aiEnabled) {
            ai(); // Run AI if enabled
        }
    }
    setTimeout(timerCallback, fps); // Adjust the loop speed based on FPS
}

function isReady() {
    if (modelIsLoaded && cameraAvailable) {
        document.getElementById("loadingText").style.display = "none";
        document.getElementById("ai").disabled = false;
        return true;
    } else {
        return false;
    }
}

function setResolution() {
    if (window.screen.width < video.videoWidth) {
        c1.width = window.screen.width * 0.9;
        let factor = c1.width / video.videoWidth;
        c1.height = video.videoHeight * factor;
    } else if (window.screen.height < video.videoHeight) {
        c1.height = window.screen.height * 0.50;
        let factor = c1.height / video.videoHeight;
        c1.width = video.videoWidth * factor;
    }
    else {
        c1.width = video.videoWidth;
        c1.height = video.videoHeight;
    }
}

function toggleAi() {
    aiEnabled = document.getElementById("ai").checked;
}

function changeFps() {
    fps = 1000 / document.getElementById("fps").value;
}

function ai() {
    // Detect objects in the video element
    objectDetector.detect(video, (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(results); // Will output bounding boxes of detected objects
        results.forEach((element) => {
            ctx1.font = "15px Arial";
            ctx1.fillStyle = "red";
            ctx1.fillText(
                element.label + " - " + (element.confidence * 100).toFixed(2) + "%", 
                element.bbox[0] + 10, element.bbox[1] + 15
            );
            ctx1.beginPath();
            ctx1.strokeStyle = "green";
            ctx1.rect(element.bbox[0], element.bbox[1], element.bbox[2], element.bbox[3]);
            ctx1.stroke();
        });
    });
}
