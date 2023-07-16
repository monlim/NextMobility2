// status fields and start button in UI
const loadButton = document.getElementById("loadButton");
const responseDiv = document.getElementById("responseDiv");
const phraseDiv = document.getElementById("phraseDiv");
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const voiceDict = [
  "en-US-JennyNeural",
  "en-US-GuyNeural",
  "en-PH-RosaNeural",
  "en-IN-PrabhatNeural",
  "en-HK-YanNeural",
  "ko-KR-SunHiNeural",
  "ko-KR-InJoonNeural",
  "zh-CN-XiaoxiaoNeural",
  "zh-CN-YunxiNeural",
  "vi-VN-NamMinhNeural",
  "en-US-JennyNeural",
];
const voiceExtras = [
  "",
  "",
  "😁",
  "💔",
  "🤔",
  "😱",
  "But internationally, ",
  "",
  "I love you. ",
  "I hate you. ",
  "",
  "I don't care, but ",
  "",
  "What an asshole. ",
  "",
  "Last time I was in Korea, ",
];

let mouthLine = 3;
let isOpen = false;
let playerPlaying = false;

// Subscription key and region for speech services.
let subscriptionKey = "5dd7e34e61c6470481c6327b4a7ae628";
const serviceRegion = "australiaeast";

let SpeechSDK;
let synthesizer;
let extraNum = 1;
setTimeout(function () {
  extraNum = 16;
  console.log("change");
}, 300000);
let style = "chat";
let rate = 1;
let voice = voiceDict[getRandomInt(11)];
console.log(voice);
if (voice === "en-US-JennyNeural") {
  style = "whispering";
  rate = -10;
} else if (voice === "en-US-GuyNeural") {
  style = "angry";
  rate = 20;
} else if (voice === "zh-CN-XiaoxiaoNeural") {
  style = "chat";
  rate = 10;
}

//function to combine prompt
function autoComplete(prompt) {
  return new Promise((resolve, reject) => {
    let text = voiceExtras[getRandomInt(extraNum)] + phraseDiv.value;
    resolve(text);
  });
}

//Tone.js modules
const player = new Tone.Player();
player.sync().start(0);
const gainNode = new Tone.Gain(0.5).toDestination();
player.chain(gainNode);
player.loop = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//function to synthesise neural voice
phraseDiv.addEventListener("keypress", function (event) {
  //submit.disabled = true;
  //submit.innerText = "GENERATING..";
  if (event.key === "Enter") {
    event.preventDefault();
    console.log("enter");
    autoComplete(phraseDiv.value).then((val) => {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        subscriptionKey,
        serviceRegion
      );
      speechConfig.speechSynthesisOutputFormat =
        "Audio24Khz160KBitRateStereoMp3";

      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

      let inputText = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
            <voice name="${voice}"><mstts:express-as style="${style}" styledegree="2"><prosody rate="${rate}%" volume="90">${val}</prosody></mstts:express-as></voice></speak>`;

      synthesizer.speakSsmlAsync(inputText, (result) => {
        //submit.disabled = false;
        synthesizer.close();
        synthesizer = undefined;
        phraseDiv.value = "";

        source = audioCtx.createBufferSource();
        audioCtx.decodeAudioData(
          result.audioData,

          (audioBuffer) => {
            tab = new Tone.ToneAudioBuffer();
            tab.set(audioBuffer);

            if (playerPlaying) {
              Tone.Transport.pause();
            }
            player._buffer = tab;
            Tone.Transport.position = Tone.Time(0);
            if (playerPlaying) {
              Tone.Transport.start();
            }
          },

          (e) => {
            console.log("Error with decoding audio data" + e.err);
          }
        );
      });

      //submit.innerText = "SUBMIT";
      //submit.disabled = false;
    });
  }
});

if (!!window.SpeechSDK) {
  SpeechSDK = window.SpeechSDK;
  //submit.disabled = false;
  //submit.innerText = "SUBMIT";

  document.getElementById("content").style.display = "block";
}

// Pauses and resumes audio when mouth is open or closed
function playerControl(isOpen) {
  // Don't do anything if we're already playing, or if we haven't set a buffer yet
  if (playerPlaying == isOpen || !player._buffer.length) return;
  playerPlaying = isOpen;
  if (isOpen) {
    Tone.Transport.start();
    player.volume.value = 0;
  } else {
    Tone.Transport.pause();
    player.volume.value = -36;
  }
}

//linear scaling function
function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return capped * scale + to[0];
}

//draw mouth line and obtain facial landmarks
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      //drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
      //               {color: '#C0C0C070', lineWidth: 1});
      //drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
      //drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
      //drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
      //drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
      //drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
      //drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30'});
      //drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {
        color: "#0000ff",
        lineWidth: mouthLine,
      });
    }
  }
  canvasCtx.restore();
  if (results.multiFaceLandmarks[0]) {
    topLip = results.multiFaceLandmarks[0][13];
    bottomLip = results.multiFaceLandmarks[0][14];
    verticalMouth = (bottomLip.y - topLip.y) * 100;
    mouthLine = scaleValue(verticalMouth, [0, 8], [2, 25]);
    gainValue = scaleValue(verticalMouth, [0, 6], [0, 1]);
    gainNode.gain.rampTo(gainValue, 0.1);
    isOpen = verticalMouth > 1;
    playerControl(isOpen);
  }
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});
faceMesh.setOptions({
  selfieMode: true,
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1800,
  height: 1080,
});
camera.start();
