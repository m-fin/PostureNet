let video;
let poseNet;
let poses = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function (results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {
  image(video, 0, 0, width, height);

  isGoodPosture();
  isStanding();

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

function isGoodPosture() {
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;

    leftEar = pose.keypoints[3];
    rightEar = pose.keypoints[4];

    leftHip = pose.keypoints[11];
    rightHip = pose.keypoints[12];

    let dominantEar;
    let dominantHip;

    if (leftEar.score > rightEar.score) {
      dominantEar = leftEar;
      dominantHip = leftHip;
    }
    else {
      dominantEar = rightEar;
      dominantHip = rightHip;
    }

    let earToHipDifference = dominantEar.position.x - dominantHip.position.x;

    // let goodPosture = false;
    if (abs(earToHipDifference) < 30) {
      return true;
    }
    else {
      return false;
    }
  }
}

function isStanding() {
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;

    leftHip = pose.keypoints[11];
    rightHip = pose.keypoints[12];

    leftKnee = pose.keypoints[13];
    rightKnee = pose.keypoints[14];

    averageHipPositionY = (leftHip.position.y + rightHip.position.y) / 2;
    averageKneePositionY = (leftKnee.position.y + rightKnee.position.y) / 2;

    let isStanding = false;
    differenceBetweenAverageHipAndKneePositionY = averageHipPositionY - averageKneePositionY;

    if (abs(differenceBetweenAverageHipAndKneePositionY) > 50) {
      isStanding = true;
    }

    document.getElementById("output").innerHTML = isStanding;

    return isStanding;
  }
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints

    let pose = poses[i].pose;

    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        if (isGoodPosture()) {
          fill(0, 255, 0);
        }
        else {
          fill(255, 0, 0);
        }
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      if (isGoodPosture()) {
        stroke(0, 255, 0);
      }
      else {
        stroke(255, 0, 0);
      }
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }





}