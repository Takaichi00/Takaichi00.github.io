const maskData = require('./maskData');

 module.exports = {
     mask: (elm) => {
         function enablestart() {
             const startbutton = document.getElementById('startbutton');
             startbutton.value = "start";
             startbutton.disabled = null;
         }

         function adjustVideoProportions() {
             // resize overlay and video if proportions are not 4:3
             // keep same height, just change width
             var proportion = vid.videoWidth / vid.videoHeight;
             vid_width = Math.round(vid_height * proportion);
             vid.width = vid_width;
             vid.height = vid_height;
             overlay.width = vid_width;
             overlay.height = vid_height;
             webgl_overlay.width = vid_width;
             webgl_overlay.height = vid_height;
             webGLContext.viewport(0, 0, webgl_overlay.width, webgl_overlay.height);
         }


         function gumSuccess(stream) {
             // add camera stream if getUserMedia succeeded
             // if ("srcObject" in vid) {
             //     vid.srcObject = stream;
             // } else {
             //     vid.src = (window.URL && window.URL.createObjectURL(stream));
             // }
             adjustVideoProportions();
             fd.init(webgl_overlay);
             vid.onloadedmetadata = function () {
                 // vid.play();
             };
             vid.onresize = function () {
                 adjustVideoProportions();
                 fd.init(webgl_overlay);
                 if (trackingStarted) {
                     ctrack.stop();
                     ctrack.reset();
                     ctrack.start(vid);
                 }
             };
         }

         function gumFail() {
             // fall back to video if getUserMedia failed
             document.getElementById('gum').className = "hide";
             document.getElementById('nogum').className = "nohide";
             alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
         }

         /*********** Code for face tracking and face masking *********/

         function updateMask(el) {
             currentMask = parseInt(el.target.value, 10);
             switchMasks();
         }

         function startVideo() {
             // start video
             // vid.play();
             // start tracking
             ctrack.start(vid);
             trackingStarted = true;
             // start drawing face grid
             drawGridLoop();
         }


         function drawGridLoop() {
             // get position of face
             positions = ctrack.getCurrentPosition();
             overlayCC.clearRect(0, 0, vid_width, vid_height);
             if (positions) {
                 // draw current grid
                 ctrack.draw(overlay);
             }
             // check whether mask has converged
             const pn = ctrack.getConvergence();
             if (pn < 0.9) {
                 switchMasks();
                 requestAnimFrame(drawMaskLoop);
             } else {
                 requestAnimFrame(drawGridLoop);
             }
         }

         function switchMasks() {
             // get mask
             const maskname = Object.keys(masks)[currentMask];
             fd.load(document.getElementById(maskname), masks[maskname], pModel);
         }

         function drawMaskLoop() {
             // get position of face
             positions = ctrack.getCurrentPosition();
             overlayCC.clearRect(0, 0, vid_width, vid_height);
             if (positions) {
                 // draw mask on top of face
                 fd.draw(positions);
             }
             animationRequest = requestAnimFrame(drawMaskLoop);
         }

         const detectDeviceType = () =>
             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 ? 'Mobile'
                 : 'Desktop';
         /*********** Code for stats **********/

         const button = document.querySelector('#startbutton');
         const setupButton = document.querySelector('#videobutton');

         if(detectDeviceType() === 'Mobile') {
             button.addEventListener('touchstart', () => {
                 startVideo();
             });
         } else {
             button.addEventListener('click', () => {
                 startVideo();
             });
         }

         const videoStart = () => {
//              navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
//              window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
// // check for camerasupport
//              if (navigator.mediaDevices) {
//                  navigator.mediaDevices.getUserMedia({video: true}).then(gumSuccess).catch(gumFail);
//              } else if (navigator.getUserMedia) {
//                  navigator.getUserMedia({video: true}, gumSuccess, gumFail);
//              } else {
//                  document.getElementById('gum').className = "hide";
//                  document.getElementById('nogum').className = "nohide";
//                  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
//              }
             gumSuccess();
             enablestart();
         };

         if(detectDeviceType() === 'Mobile') {
             setupButton.addEventListener('touchstart', () => {
                 videoStart();
             })
         } else {
             setupButton.addEventListener('click', () => {
                 videoStart();
             })
         }

         let vid = elm;
         let vid_width = 800;
         let vid_height = 800;
         let overlay = document.getElementById('overlay');
         let overlayCC = overlay.getContext('2d');
         let webgl_overlay = document.getElementById('webgl');
         let webGLContext = webgl_overlay.getContext('webgl',{ premultipliedAlpha: false });

         let ctrack = new clm.tracker();
         ctrack.init(pModel);
         let trackingStarted = false;
         document.getElementById('selectmask').addEventListener('change', updateMask, false);
         let positions;
         let fd = new faceDeformer();
         let masks = maskData;
         let currentMask = 0;
         let animationRequest;

         let stats = new Stats();
         stats.domElement.style.position = 'absolute';
         stats.domElement.style.top = '0px';
         document.getElementById('remote-media').appendChild(stats.domElement);
         document.addEventListener("clmtrackrIteration", function (event) {
             stats.update();
         }, false);
     }
};
