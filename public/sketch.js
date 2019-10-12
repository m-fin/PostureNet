let video;
let poseNet;
let poses = [];

var posture = {
  isGoodShoulderPosture: false,
  isGoodHeadPosture: false,
  isGoodLegPosture: false,
  isGoodAnklePosture: false,
  isGoodPosture: false,
  isStanding: false,

  timeSitting: 0,
  timeStanding: 0
}

function setup() {
  var path = window.location.pathname;
  var page = path.split("/").pop();

  if (page === "stats.html") {
    createCanvas(0, 0);
  }
  else {
    createCanvas(640, 480);
  }
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

  postureAlgorithm();

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

setInterval(calculateStatistics, 1000);

function calculateStatistics() {
  if (!posture.isStanding) {
    posture.timeSitting += 1;
  }
  else {
    posture.timeSitting = 0;
  }

  // let s = 25 * 60 - posture.timeSitting;
  let s = 25 * 60 - posture.timeSitting;
  if (s > 0) {
    document.getElementById("breakTimer").innerHTML = (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
  }
  else {
    document.getElementById("breakTimer").innerHTML = "0:00";
  }

  if (s === -1) {
    alert("Time to take a break!");
  }
}

function postureAlgorithm() {
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;

    // 0	nose
    // 1	leftEye
    // 2	rightEye
    // 3	leftEar
    // 4	rightEar
    // 5	leftShoulder
    // 6	rightShoulder
    // 7	leftElbow
    // 8	rightElbow
    // 9	leftWrist
    // 10	rightWrist
    // 11	leftHip
    // 12	rightHip
    // 13	leftKnee
    // 14	rightKnee
    // 15	leftAnkle
    // 16	rightAnkle

    nose = pose.keypoints[0];
    leftEye = pose.keypoints[1];
    rightEye = pose.keypoints[2];
    leftEar = pose.keypoints[3];
    rightEar = pose.keypoints[4];
    leftShoulder = pose.keypoints[5];
    rightShoulder = pose.keypoints[6];
    leftElbow = pose.keypoints[7];
    rightElbow = pose.keypoints[8];
    leftWrist = pose.keypoints[9];
    rightWrist = pose.keypoints[10];
    leftHip = pose.keypoints[11];
    rightHip = pose.keypoints[12];
    leftKnee = pose.keypoints[13];
    rightKnee = pose.keypoints[14];
    leftAnkle = pose.keypoints[15];
    rightAnkle = pose.keypoints[16];

    // Detect side
    let isRightSide = false;
    if (rightEar.score > leftEar.score) {
      isRightSide = true;
    }
    else {
      isRightSide = false;
    }

    // Set dominant parts
    let dominantShoulder;
    let dominantHip;
    let dominantEar;
    let dominantKnee;
    let dominantAnkle;

    // Detect side
    if (isRightSide) {
      dominantShoulder = rightShoulder;
      dominantHip = rightHip;
      dominantEar = rightEar;
      dominantKnee = rightKnee;
      dominantAnkle = rightAnkle;
    }
    else {
      dominantShoulder = leftShoulder;
      dominantHip = leftHip;
      dominantEar = rightEar;
      dominantKnee = leftKnee;
      dominantAnkle = leftAnkle;
    }

    let shoulderToHipDifferenceX = dominantShoulder.position.x - dominantHip.position.x;
    let earToShoulderDifferenceX = dominantEar.position.x - dominantShoulder.position.x;
    let kneeToHipDifferenceY = dominantKnee.position.y - dominantHip.position.y;



    // Set isGoodShoulderPosture
    if (abs(shoulderToHipDifferenceX) < 30) {
      posture.isGoodShoulderPosture = true;
    }
    else {
      posture.isGoodShoulderPosture = false;
    }

    // Set isGoodHeadPosture
    if (abs(earToShoulderDifferenceX) < 30) {
      posture.isGoodHeadPosture = true;
    }
    else {
      posture.isGoodHeadPosture = false;
    }

    if (posture.isGoodShoulderPosture && posture.isGoodHeadPosture) {
      posture.isGoodPosture = true;
    }
    else {
      posture.isGoodPosture = false;
    }

    // Detect if standing
    averageHipPositionY = (leftHip.position.y + rightHip.position.y) / 2;
    averageKneePositionY = (leftKnee.position.y + rightKnee.position.y) / 2;
    differenceBetweenAverageHipAndKneePositionY = averageHipPositionY - averageKneePositionY;

    if (abs(differenceBetweenAverageHipAndKneePositionY) > 100) {
      posture.isStanding = true;
    }
    else {
      posture.isStanding = false;
    }
  }
}

// function isGoodPosture() {
//   let isGoodShoulderPosture = false;
//   let isGoodHeadPosture = false;

//   for (let i = 0; i < poses.length; i++) {
//     // For each pose detected, loop through all the keypoints
//     let pose = poses[i].pose;

//     leftEar = pose.keypoints[3];
//     rightEar = pose.keypoints[4];

//     leftHip = pose.keypoints[11];
//     rightHip = pose.keypoints[12];

//     let dominantEar;
//     let dominantHip;

//     if (leftEar.score > rightEar.score) {
//       dominantEar = leftEar;
//       dominantHip = leftHip;
//     }
//     else {
//       dominantEar = rightEar;
//       dominantHip = rightHip;
//     }

//     let earToHipDifference = dominantEar.position.x - dominantHip.position.x;

//     // let goodPosture = false;
//     if (abs(earToHipDifference) < 30) {
//       return true;
//     }
//     else {
//       return false;
//     }
//   }
// }

// function isStanding() {
//   for (let i = 0; i < poses.length; i++) {
//     // For each pose detected, loop through all the keypoints
//     let pose = poses[i].pose;

//     leftHip = pose.keypoints[11];
//     rightHip = pose.keypoints[12];

//     leftKnee = pose.keypoints[13];
//     rightKnee = pose.keypoints[14];

//     averageHipPositionY = (leftHip.position.y + rightHip.position.y) / 2;
//     averageKneePositionY = (leftKnee.position.y + rightKnee.position.y) / 2;

//     let isStanding = false;
//     differenceBetweenAverageHipAndKneePositionY = averageHipPositionY - averageKneePositionY;

//     if (abs(differenceBetweenAverageHipAndKneePositionY) > 50) {
//       isStanding = true;
//     }

//     document.getElementById("output").innerHTML = isStanding;

//     return isStanding;
//   }
// }


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
        if (posture.isGoodPosture) {
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
      if (posture.isGoodPosture) {
        stroke(0, 255, 0);
      }
      else {
        stroke(255, 0, 0);
      }
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
