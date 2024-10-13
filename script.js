// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// The link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/8tu_VH4Yk/";
let model, webcam, ctx, labelContainer, maxPredictions;

// Create a string to hold the input from the prediction classes, initialized to the empty string
var result = "";

// Get the screen dimensions
const height = window.screen.height;
const width = window.screen.width;

// Adjust the width of certain DOM elements based on screen width
document.getElementById("result-timer-wrapper").style.width = width - 5 + "px";
document.getElementById("pass-container").style.width = width + "px";
document.getElementById("btn-container").style.width = width + "px";

// Function to initialize the model and webcam
async function init() {
  const modelURL = URL + "model.json"; // URL for the model
  const metadataURL = URL + "metadata.json"; // URL for the metadata

  // Load the model and metadata
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses(); // Get the total number of prediction classes

  const flip = true; // Whether to flip the webcam
  webcam = new tmPose.Webcam(width, width, flip); // Setup the webcam with specified dimensions
  await webcam.setup(); // Request access to the webcam
  await webcam.play(); // Start the webcam feed
  window.requestAnimationFrame(loop); // Start the animation loop

  // Setup the canvas for drawing predictions
  const canvas = document.getElementById("canvas");
  canvas.width = width;
  canvas.height = width;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");

  // Create a label container for displaying prediction results
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

// Animation loop to update webcam and make predictions
async function loop(timestamp) {
  webcam.update(); // Update the webcam frame
  await predict(); // Make predictions based on the current webcam frame
  window.requestAnimationFrame(loop); // Continue the loop
}

// Function to predict the pose and display results
async function predict() {
  // Prediction #1: Estimate the pose using the webcam canvas
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

  // Prediction #2: Run the input through the Teachable Machine classification model
  const prediction = await model.predict(posenetOutput);

  // Update label container with prediction results
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  // Draw the detected poses on the canvas
  drawPose(pose);

  // Make certain elements visible after prediction
  document.getElementById("pass-container").style.visibility = "visible";
  document.getElementById("result").style.visibility = "visible";
  document.getElementById("btn-container").style.visibility = "visible";

  let displayedResult = "";
  // Check probabilities and concatenate the letter matching the trained model to the result string
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

  // Set the innerText of the element with id 'result' to the displayedResult string
  document.getElementById("result").innerText = displayedResult;
}

// Function to draw the detected pose on the canvas
function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0); // Draw the webcam image on the canvas
    // Draw the keypoints and skeleton if pose is detected
    if (pose) {
      const minPartConfidence = 0.5; // Minimum confidence for keypoints
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx); // Draw keypoints
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx); // Draw skeleton
    }
  }
}

// Function to pause the webcam and process predictions
async function pause() {
  // Stops the webcam
  await webcam.setup();
  webcam.stop();

  // Make predictions after pausing
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);

  // Update label container with prediction results
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  // Check probabilities and concatenate the letter matching the trained model to the result string
  if (prediction[0].probability > 0.5) {
    result += "I";
    document.getElementById("myInput").value = result; // Update input value
  }
  if (prediction[1].probability > 0.5) {
    result += "K";
    document.getElementById("myInput").value = result; // Update input value
  }
  if (prediction[2].probability > 0.5) {
    result += "T";
    document.getElementById("myInput").value = result; // Update input value
  }
  if (prediction[3].probability > 0.5) {
    result += "O";
    document.getElementById("myInput").value = result; // Update input value
  }

  // Reset color changes from incorrect password attempts
  document.getElementById("myInput").style.backgroundColor = "#ffffff";
  document.getElementById("myInputLabel").style.visibility = "hidden";
  document.getElementById("myInputLabel").style.display = "none";
}

// Disable password input field initially
document.getElementById("myInput").disabled = "true";

// Function to delete the last character from the input field
function deleteLast() {
  let input = document.getElementById("myInput").value;
  let newInput = input.slice(0, -1); // Remove the last character
  result = newInput; // Update the result string
  document.getElementById("myInput").value = newInput; // Update input field
}

// Function to check if the input matches the saved password
function matchPassword() {
  let password = "TIK"; // Predefined password
  let input = document.getElementById("myInput").value; // Get input value
  if (input !== password) {
    // If passwords do not match, show an error message
    document.getElementById("myInputLabel").style.visibility = "visible";
    document.getElementById("myInputLabel").style.display = "block";
    document.getElementById("myInput").value = ""; // Clear input field
    result = ""; // Reset result string
    document.getElementById("myInput").style.backgroundColor = "#ffa6a6"; // Change background color to indicate error
  } else {
    // If passwords match, proceed to unlock
    document.getElementById("app-container").style.display = "none"; // Hide the app container
    document.getElementById("home-screen").style.visibility = "visible"; // Show the home screen
  }
}

// Function to toggle the visibility of the password input
function showPasswordToggler() {
  let x = document.getElementById("myInput");
  if (x.type === "password") {
    x.type = "text"; // Show the password
  } else {
    x.type = "password"; // Hide the password
  }
}

// Code responsible for swiping the lock screen open
let touchstartY = 0; // Starting Y coordinate for touch
let touchendY = 0; // Ending Y coordinate for touch
let hasEventHappened = false; // Flag to prevent multiple events

function checkDirection() {
  if (!hasEventHappened) {
    if (touchendY < touchstartY) {
      // If swipe up, toggle fullscreen and show app container
      toggleFullscreen();
      document.getElementById("lock-screen").style.display = "none"; // Hide lock screen
      document.getElementById("app-container").style.visibility = "visible"; // Show app container
      init(); // Initialize the model and webcam
    }
    hasEventHappened = true; // Set the flag to true to prevent multiple events
  }
}

// Event listeners for touch events
document.addEventListener("touchstart", (e) => {
  touchstartY = e.changedTouches[0].screenY; // Get starting Y coordinate
});

document.addEventListener("touchend", (e) => {
  touchendY = e.changedTouches[0].screenY; // Get ending Y coordinate
  checkDirection(); // Check swipe direction
});

// Full-Screen Mode Toggle Code
function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullscreenElement ||
    document.msFullscreenElement
  );
}

// Function to toggle full-screen mode
function toggleFullscreen() {
  if (getFullscreenElement()) {
    document.exitFullscreen(); // Exit full-screen mode
  } else {
    document.documentElement.requestFullscreen().catch((e) => {
      console.log(e); // Log any errors
    });
  }
}

// Function to start a timer
function startTimer(duration, display) {
  var timer = duration; // Initialize the timer
  setInterval(function () {
    duration = 10; // Reset duration to 10
    seconds = parseInt(timer % 60, 10); // Get seconds

    // Display seconds in the specified format
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = seconds; // Update the display

    // Change display color based on time left
    if (seconds <= 3) {
      display.style.color = "#FF0000"; // Change color to red
    } else {
      display.style.color = "black"; // Change back to black
    }

    if (--timer < 0) {
      timer = duration; // Reset timer
      // If timer hits 0 seconds, capture letter value and restart feed
      pause(); // Pause the webcam
      init(); // Reinitialize the model and webcam
    }
  }, 1000); // Run every second
}

// On window load, start the timer
window.onload = function () {
  let timerSeconds = 20; // Initial wait time
  let display = document.querySelector("#time"); // Get timer display element
  startTimer(timerSeconds, display); // Start the timer
};
