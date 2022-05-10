import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([
    { client: 'Chrome' },
]);
function testSupport(supportedDevices) {
    const deviceDetector = new DeviceDetector();
    const detectedDevice = deviceDetector.parse(navigator.userAgent);
    let isSupported = false;
    for (const device of supportedDevices) {
        if (device.client !== undefined) {
            const re = new RegExp(`^${device.client}$`);
            if (!re.test(detectedDevice.client.name)) {
                continue;
            }
        }
        if (device.os !== undefined) {
            const re = new RegExp(`^${device.os}$`);
            if (!re.test(detectedDevice.os.name)) {
                continue;
            }
        }
        isSupported = true;
        break;
    }
    if (!isSupported) {
        alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
            `is not well supported at this time, expect some flakiness while we improve our code.`);
    }
}

//Gesture Recognition
var M3GESTURE = M3GESTURE || {};
M3GESTURE.LArmed = false;
M3GESTURE.RArmed = false;
M3GESTURE.lowThresh = 0.2;
M3GESTURE.highThresh = 0.8;
// M3GESTURE.Nx = 0.5; //Nose X
// M3GESTURE.RWx = 0.5; //Right wrist x
// M3GESTURE.RWy = 0.5; //right wrist y
// M3GESTURE.LWy = 0.5; //left wrist x
// M3GESTURE.LWx = 0.5; //left wrist y

// //every 100 milliseconds, sample a point from the pose recognizer
// M3GESTURE.sample = setInterval(M3GESTURE.pushToBuffer(), 100);

// M3GESTURE.pushToBuffer = function() {
//     M3GESTURE.buffer.push({M3GESTURE.Nx, M3GESTURE.RWx, M3GESTURE.RWy, M3GESTURE.LWx, M3GESTURE.LWy});
// }

const controls = window;
const LandmarkGrid = window.LandmarkGrid;
const drawingUtils = window;
const mpPose = window;
const options = {
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}/${file}`;
    }
};
// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const grid = new LandmarkGrid(landmarkContainer, {
    connectionColor: 0xCCCCCC,
    definedColors: [{ name: 'LEFT', value: 0xffa500 }, { name: 'RIGHT', value: 0x00ffff }],
    range: 2,
    fitToGrid: true,
    labelSuffix: 'm',
    landmarkSize: 2,
    numCellsPerAxis: 4,
    showHidden: false,
    centered: true,
});
let activeEffect = 'mask';
function onResults(results) {
    // Hide the spinner.
    document.body.classList.add('loaded');
    // Update the frame rate.
    fpsControl.tick();
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.segmentationMask) {
        canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
        // Only overwrite existing pixels.
        if (activeEffect === 'mask' || activeEffect === 'both') {
            canvasCtx.globalCompositeOperation = 'source-in';
            // This can be a color or a texture or whatever...
            canvasCtx.fillStyle = '#00FF007F';
            canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        }
        else {
            canvasCtx.globalCompositeOperation = 'source-out';
            canvasCtx.fillStyle = '#0000FF7F';
            canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        }
        // Only overwrite missing pixels.
        canvasCtx.globalCompositeOperation = 'destination-atop';
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'source-over';
    }
    else {
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    }
    if (results.poseLandmarks) {
        ///// Added Code Start /////
        //Print out location of points I'm interested in:
        //Uses selfie mode so right arm displayed on right of screen
        //x is horizontal, y is vertical (0,0 = top left)
        //Left wrist = [16], Right wrist = [15], left shoulder = [12], right shoulder = [11]

        // console.log("Nx: " + results.poseLandmarks[0].x); //0 is nose - use as centerline
        // console.log("RWx: " + results.poseLandmarks[15].x + " RWy: " + results.poseLandmarks[15].y); //left wrist 
        // console.log("LWx: " + results.poseLandmarks[16].x + " LWy: " + results.poseLandmarks[16].y); //right wrist
        
        //Left arm
        if(results.poseLandmarks[16].y < M3GESTURE.lowThresh && results.poseLandmarks[16].y > 0) {
            M3GESTURE.LArmed = true;
            console.log("L Armed");
        }
        if(M3GESTURE.LArmed && results.poseLandmarks[16].y > M3GESTURE.highThresh && results.poseLandmarks[16].y < 1) {
            M3GESTURE.LArmed = false;
            //if wrist is to the right of shoulder type 2 else type 1
            if(results.poseLandmarks[16].x < 0 || results.poseLandmarks[16].x > 1) {
                console.log(-1);
                //do nothing
            } else if(results.poseLandmarks[16].x > results.poseLandmarks[12].x) {
                console.log(1);
                typeLetter(1);
            } else {
                console.log(0);
                typeLetter(0);
            }
        }
        //Right arm
        if(results.poseLandmarks[15].y < M3GESTURE.lowThresh && results.poseLandmarks[15].y > 0) {
            M3GESTURE.RArmed = true;
            console.log("R Armed");
        }
        if(M3GESTURE.RArmed && results.poseLandmarks[15].y > M3GESTURE.highThresh && results.poseLandmarks[15].y < 1) {
            M3GESTURE.RArmed = false;
            //if wrist is to the right of shoulder type 4 else type 3
            if(results.poseLandmarks[15].x < 0 || results.poseLandmarks[15].x > 1) {
                console.log(-1);
                //do nothing
            } else if(results.poseLandmarks[15].x > results.poseLandmarks[11].x) {
                console.log(3);
                typeLetter(3);
            } else {
                console.log(2);
                typeLetter(2);
            }
        }

        /////////////// Added Code End ///////////////

        drawingUtils.drawConnectors(canvasCtx, results.poseLandmarks, mpPose.POSE_CONNECTIONS, { visibilityMin: 0.65, color: 'white' });
        drawingUtils.drawLandmarks(canvasCtx, Object.values(mpPose.POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]), { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' });
        drawingUtils.drawLandmarks(canvasCtx, Object.values(mpPose.POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]), { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' });
        drawingUtils.drawLandmarks(canvasCtx, Object.values(mpPose.POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]), { visibilityMin: 0.65, color: 'white', fillColor: 'white' });
    }
    canvasCtx.restore();
    if (results.poseWorldLandmarks) {
        grid.updateLandmarks(results.poseWorldLandmarks, mpPose.POSE_CONNECTIONS, [
            { list: Object.values(mpPose.POSE_LANDMARKS_LEFT), color: 'LEFT' },
            { list: Object.values(mpPose.POSE_LANDMARKS_RIGHT), color: 'RIGHT' },
        ]);
    }
    else {
        grid.updateLandmarks([]);
    }
}
const pose = new mpPose.Pose(options);
pose.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, {
    selfieMode: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    effect: 'background',
})
    .add([
    new controls.StaticText({ title: 'MediaPipe Pose' }),
    fpsControl,
    new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new controls.SourcePicker({
        onSourceChanged: () => {
            // Resets because this model gives better results when reset between
            // source changes.
            pose.reset();
        },
        onFrame: async (input, size) => {
            const aspect = size.height / size.width;
            let width, height;
            if (window.innerWidth > window.innerHeight) {
                height = window.innerHeight;
                width = height / aspect;
            }
            else {
                width = window.innerWidth;
                height = width * aspect;
            }
            canvasElement.width = width;
            canvasElement.height = height;
            await pose.send({ image: input });
        },
    }),
    new controls.Slider({
        title: 'Model Complexity',
        field: 'modelComplexity',
        discrete: ['Lite', 'Full', 'Heavy'],
    }),
    new controls.Toggle({ title: 'Smooth Landmarks', field: 'smoothLandmarks' }),
    new controls.Toggle({ title: 'Enable Segmentation', field: 'enableSegmentation' }),
    new controls.Toggle({ title: 'Smooth Segmentation', field: 'smoothSegmentation' }),
    new controls.Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
    }),
    new controls.Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
    }),
    new controls.Slider({
        title: 'Effect',
        field: 'effect',
        discrete: { 'background': 'Background', 'mask': 'Foreground' },
    }),
])
    .on(x => {
    const options = x;
    videoElement.classList.toggle('selfie', options.selfieMode);
    activeEffect = x['effect'];
    pose.setOptions(options);
});
