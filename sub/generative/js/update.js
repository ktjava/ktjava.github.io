onmessage = function(e) {
  var nodeNumber = e.data["nodeNumber"], mouseX = e.data["mouseX"], mouseY = e.data["mouseY"],
    positionArray = e.data["positionArray"], velocityArray = e.data["velocityArray"];
  for(var i=0; i<nodeNumber; ++i){
    var rangeX = mouseX - positionArray[i].x, rangeY = mouseY - positionArray[i].y, range = Math.sqrt(rangeX*rangeX+rangeY*rangeY), coefV = 0.0000001 / range*range*range;
    velocityArray[i].x += coefV * rangeX;
    velocityArray[i].y += coefV * rangeY;
    positionArray[i].x += velocityArray[i].x;
    positionArray[i].y += velocityArray[i].y;
  }
  postMessage({"positionArray": positionArray, "velocityArray": velocityArray});
}
