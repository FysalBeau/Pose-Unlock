// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/8tu_VH4Yk/";
let model, webcam, ctx, labelContainer, maxPredictions;

//create a string to hold the input from the prediction classes, initialized to the empty string
var result = "";

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const width = 394;
  const height = 370;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(width, height, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  const canvas = document.getElementById("canvas");
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  // finally draw the poses
  drawPose(pose);

  document.getElementById("pass-container").style.visibility = "visible";
  document.getElementById("result").style.visibility = "visible";
  document.getElementById("btn-container").style.visibility = "visible";

  let displayedResult = "";
  // if conditionals that concat the letter matching the trained model to the result string
  if (prediction[0].probability > 0.5) {
    displayedResult = "I";
  }
  if (prediction[1].probability > 0.5) {
    displayedResult = "K";
  }
  if (prediction[2].probability > 0.5) {
    displayedResult = "T";
  }
  if (prediction[3].probability > 0.5) {
    displayedResult = "O";
  }
  //set innerText of element with id result to the displayedResult string
  document.getElementById("result").innerText = displayedResult;
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}

// function that
async function pause() {

  // Convenience function to setup a webcam
  const width = 394;
  const height = 370;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(width, height, flip); // width, height, flip
    //stops the webcam!!
  await webcam.setup();
  webcam.stop();

  //stops the webcam!!

  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  // if conditionals that concat the letter matching the trained model to the result string
  // result is GLOBAL
  if (prediction[0].probability > 0.5) {
    result = result + "I";
    document.getElementById("myInput").value = result;
  }
  if (prediction[1].probability > 0.5) {
    result = result + "K";
    document.getElementById("myInput").value = result;
  }
  if (prediction[2].probability > 0.5) {
    result = result + "T";
    document.getElementById("myInput").value = result;
  }
  if (prediction[3].probability > 0.5) {
    result = result + "O";
    document.getElementById("myInput").value = result;
  }
  // Reset color changes from wrong password
  document.getElementById("myInput").style.backgroundColor = "#ffffff";
  document.getElementById("myInputLabel").style.visibility = "hidden";
  document.getElementById("myInputLabel").style.display = "none";
}

function deleteLast() {
  let input = document.getElementById("myInput").value;
  let newInput = input.slice(0, -1);
  result = newInput;
  document.getElementById("myInput").value = newInput;
}

// function to check if password input field matches saved password
function matchPassword() {
  let password = "TIK";
  let input = document.getElementById("myInput").value;
  if (input != password) {
    // alert("Passwords did not match");
    document.getElementById("myInputLabel").style.visibility = "visible";
    document.getElementById("myInputLabel").style.display = "block";
    document.getElementById("myInput").value = "";
    result = "";
    document.getElementById("myInput").style.backgroundColor = "#ffa6a6";
  } else {
    document.getElementById("app-container").style.display = "none";
    document.getElementById("home-screen").style.visibility = "visible";
  }
}

//function for show password checkbox logic
function showPasswordToggler() {
  let x = document.getElementById("myInput");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

//function responsible for unlocking the screen
// function unlockScreen() {
//   document.getElementById("lock-screen").style.display = "none";
//   document.getElementById("app-container").style.visibility = "visible";
//   init();
//   toggleFullscreen();
// }

// code responsible for swiping the lock screen open (Start)

let touchstartY = 0;
let touchendY = 0;
let hasEventHappened = false;

function checkDirection() {
  if (hasEventHappened === false) {
    if (touchendY < touchstartY) {
      document.getElementById("lock-screen").style.display = "none";
      document.getElementById("app-container").style.visibility = "visible";
      init();
      toggleFullscreen();
    }
    hasEventHappened = true;
  }
}

document.addEventListener("touchstart", (e) => {
  touchstartY = e.changedTouches[0].screenY;
 
});

document.addEventListener("touchend", (e) => {
  touchendY = e.changedTouches[0].screenY;
  checkDirection();
});

// Full-Screen Mode Toggle Code (Start)

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullscreenElement ||
    document.msFullscreenElement
  );
}

function toggleFullscreen() {
  if (getFullscreenElement()) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen().catch((e) => {
      console.log(e);
    });
  }
}

function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  setInterval(function () {
    duration = 10;
    // minutes = parseInt(timer / 60, 10)
    seconds = parseInt(timer % 60, 10);

    // minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // display.textContent = minutes + ":" + seconds;
    display.textContent = seconds;
    if (seconds <= 3) {
      display.style.color = "#FF0000";
    } else {
      display.style.color = "black";
    }

    if (--timer < 0) {
      timer = duration;
      //if timer hits 0 seconds, capture letter value and restart feed
      pause();
      init();
    }
  }, 1000);
}

window.onload = function () {
  // Initially wait 20 seconds, program loading is laggy then 10 sec in start timer hardcoded
  let timerSeconds = 20,
    display = document.querySelector("#time");
  startTimer(timerSeconds, display);
};

const i = document.getElementById("myInput");

i.addEventListener("keydown", function (e) {
  if (
    [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ].includes(e.key)
  ) {
    e.preventDefault();
  }
});
