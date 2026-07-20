import { HandLandmarker, FilesetResolver }
  
from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const stream = await navigator.mediaDevices.getUserMedia({
    video: true
});

video.srcObject = stream;
await video.play();

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

const detector = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
        modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    },
    runningMode: "VIDEO",
    numHands: 2
});

function loop() 
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const results = detector.detectForVideo(video, performance.now());

    if (results.landmarks) 
    {
        for (const hand of results.landmarks) 
        {
            for (const landmark of hand) 
            {
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    requestAnimationFrame(loop);
}

loop();
