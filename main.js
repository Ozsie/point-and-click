var mainCanvas = document.querySelector("#game");
var mainContext = mainCanvas.getContext("2d");

var canvasWidth = mainCanvas.width;
var canvasHeight = mainCanvas.height;

var master;
var scenes = {};
var loading = 'master';

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

getJSON('master.json', function(err, response) {
  if (!err) {
    master = response;
    loading = 'scenes';
    for (var s in master.scenes) {
      getJSON(master.scenes[s], function(err, response) {
        if (!err) {
          scenes[response.id] = response;
          loading = undefined;
        } else {
          console.log(err);
        }
      });
    }
  } else {
    console.log(err);
  }
});

function drawScene() {
    mainContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // color in the background
    mainContext.fillStyle = "#EEEEEE";
    mainContext.fillRect(0, 0, canvasWidth, canvasHeight);

    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
    };
    img.src = 'https://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png';
}

function drawLoading() {
    mainContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // color in the background
    mainContext.fillStyle = "#EEEEEE";
    mainContext.fillRect(0, 0, canvasWidth, canvasHeight);

    mainContext.fillText("Loading " + loading, 10, 10);
}

setTimeout(function() {
  var startTime = (new Date()).getTime();
  if (loading) {
    drawLoading();
  } else {
    drawScene();
  }
}, 16);
