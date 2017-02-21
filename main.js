var mainCanvas = document.querySelector("#game");
var mainContext = mainCanvas.getContext("2d");
var mainCanvasLeft = mainCanvas.offsetLeft;
var mainCanvasTop = mainCanvas.offsetTop;

var canvasWidth = mainCanvas.width;
var canvasHeight = mainCanvas.height;


var master;
var scenes = {};
var loading = 'master';
var currentScene;
var drawInvisibleThings = true;
var selectedNode;

var clickHandler = function(event) {
  if (currentScene) {
     var x = event.pageX - mainCanvasLeft;
    var y = event.pageY - mainCanvasTop;
    for (var nodeIndex in currentScene.nodes) {
      var node = currentScene.nodes[nodeIndex];
      var nX = node.coordinates.x;
      var nY = node.coordinates.y;
      var xDiff = x - nX;
      var yDiff = y - nY;
      var xPow = Math.pow(xDiff, 2);
      var yPow = Math.pow(yDiff, 2);
      var d = Math.sqrt(xPow + yPow);
      console.log(d + " <= " + (5*(node.coordinates.z+1)));
      if (d <= 5*(node.coordinates.z+1)) {
        console.log(node);
        selectedNode = node;
        return;
      }
    }
  }
  selectedNode = undefined;
};
mainCanvas.addEventListener('click', clickHandler, false);

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

var background;

function findNode(scene, nodeId) {
  for (var nodeIndex in scene.nodes) {
    var node = scene.nodes[nodeIndex];
    if (node.id === nodeId) {
      return node;
    }
  }
}

function selectScene(sceneId) {
  currentScene = scenes[sceneId];
  background = new Image();
  background.onload = function() {
    drawScene();
  };
  background.src = currentScene.background;
}

function drawScene() {
  if (!currentScene) {
    selectScene('intro');
  } else {
    mainContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // color in the background
    mainContext.fillStyle = "#EEEEEE";
    mainContext.fillRect(0, 0, canvasWidth, canvasHeight);

    mainContext.drawImage(background, 0, 0);

    if (drawInvisibleThings) {
      if (selectedNode) {
        mainContext.fillText("Selected Node:", 10, 10);
        mainContext.fillText(JSON.stringify(selectedNode), 10, 20);
      }
      for (var nodeIndex in currentScene.nodes) {
        var node = currentScene.nodes[nodeIndex];
        mainContext.beginPath();
        mainContext.arc(node.coordinates.x,node.coordinates.y,5*(node.coordinates.z+1),0,2*Math.PI);
        mainContext.stroke();

        for (var connectionIndex in node.connections) {
          var connection = node.connections[connectionIndex];
          var target = findNode(currentScene, connection);
          mainContext.beginPath();
          mainContext.moveTo(node.coordinates.x,node.coordinates.y);
          mainContext.lineTo(target.coordinates.x,target.coordinates.y);
          mainContext.stroke();
        }
      }
    }
  }
}

function drawLoading() {
    mainContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // color in the background
    mainContext.fillStyle = "#EEEEEE";
    mainContext.fillRect(0, 0, canvasWidth, canvasHeight);

    mainContext.fillText("Loading " + loading, 10, 10);
}

function timeout() {
    setTimeout(function () {
        var startTime = (new Date()).getTime();
          if (loading) {
            drawLoading();
          } else {
            drawScene();
          }
        timeout();
    }, 16);
}

timeout();