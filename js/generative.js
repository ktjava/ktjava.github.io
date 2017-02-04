/// <reference path="easeljs/easeljs.d.ts" />
var project;
(function (project) {
  /**
  * パーティクルデモのメインクラスです。
  * @class project.Main
  */
  var Main = (function () {
    /**
    * @constructor
    */
    function Main() {
      var _this = this;
      this.pathList = [];
      this.mousePositions = [];
      var canvasForEasel = document.createElement("canvas");
      this.stageEaselJS = new createjs.Stage(canvasForEasel);
      this.canvasForDisplay = document.getElementById("spa-shell-bg_canvas");
      this.stageForDisplay = new createjs.Stage(this.canvasForDisplay);
      this.canvasForFadeout = document.createElement("canvas");
      if (createjs.Touch.isSupported()) {
        createjs.Touch.enable(this.stageForDisplay);
      }
      // Tickerを作成
      createjs.Ticker.timingMode = createjs.Ticker.RAF;
      createjs.Ticker.on("tick", this.handleTick, this);
      // 親子構造
      this.shapeCurve = new createjs.Shape();
      this.shapeCurve.mouseEnabled = false;
      this.stageEaselJS.addChild(this.shapeCurve);
      var max = 100;
      for (var i = 0; i < max; i++) {
        var p = new Path();
        p.setup(0, 0, 0.1 + i / max * 0.05, (60 * Math.random() * Math.random()) >> 0, i / max);
        this.pathList.push(p);
      }
      // リサイズイベント
      this.handleResize();
      window.addEventListener("resize", function () {
        _this.handleResize();
      });
    }
    /**
    * エンターフレームイベント
    */
    Main.prototype.handleTick = function () {
      var gCurve = this.shapeCurve.graphics, stageX = this.stageForDisplay.mouseX, stageY = this.stageForDisplay.mouseY;
      gCurve.clear().setStrokeStyle(1);
      this.mousePositions.unshift(new createjs.Point(stageX, stageY));
      for (var i = 0; i < this.pathList.length; i++) {
        var p = this.pathList[i];
        if (this.mousePositions.length > p.delayFrame) {
          var position = this.mousePositions[p.delayFrame];
          //    マウスの位置更新
          p.setMousePosition(position.x, position.y);
        }
        p.update();
      }
      for (var i = 0; i < this.pathList.length - 1; i++) {
        var p = this.pathList[i];
        // マウスの軌跡を変数に保存
        var p0x = p.point.x;
        var p0y = p.point.y;
        var p1x = p.prev.x;
        var p1y = p.prev.y;
        var p2x = p.prev2.x;
        var p2y = p.prev2.y;
        // カーブ用の頂点を割り出す
        var curveStartX = (p2x + p1x) / 2;
        var curveStartY = (p2y + p1y) / 2;
        var curveEndX = (p0x + p1x) / 2;
        var curveEndY = (p0y + p1y) / 2;
        // カーブは中間点を結ぶ。マウスの座標は制御点として扱う。
        gCurve.beginStroke(createjs.Graphics.getHSL(255*window.scrollY/(document.documentElement.getBoundingClientRect().height - window.innerHeight)+((p.percent) * 60), 255, 50 + Math.random() * 10)).moveTo(curveStartX, curveStartY).curveTo(p1x, p1y, curveEndX, curveEndY).endStroke();
      }
      var contextForDisplay = this.canvasForDisplay.getContext("2d");
      var contextFadeout = this.canvasForFadeout.getContext("2d");
      contextForDisplay.setTransform(1, 0, 0, 1, 0, 0);
      contextForDisplay.globalAlpha = 0.97;
      contextForDisplay.clearRect(0, 0, innerWidth, innerHeight);
      contextForDisplay.drawImage(this.canvasForFadeout, 0, 0);
      contextFadeout.clearRect(0, 0, innerWidth, innerHeight);
      contextFadeout.globalCompositeOperation = "lighter";
      contextFadeout.drawImage(this.canvasForDisplay, 0, 0);
      this.stageEaselJS.update();
      contextFadeout.drawImage(this.stageEaselJS.canvas, 0, 0);
    };
    /**
    * リサイズイベント
    */
    Main.prototype.handleResize = function () {
      this.stageEaselJS.canvas.width = innerWidth;
      this.stageEaselJS.canvas.height = innerHeight;
      this.canvasForDisplay.width = innerWidth;
      this.canvasForDisplay.height = innerHeight;
      this.canvasForFadeout.width = innerWidth;
      this.canvasForFadeout.height = innerHeight;
    };
    return Main;
  })();
  project.Main = Main;
  var Path = (function () {
    function Path() {
      this.prev = new createjs.Point();
      this.prev2 = new createjs.Point();
      this.point = new createjs.Point();
      this.mouse = new createjs.Point();
    }
    /**
    *
    * @param x
    * @param y
    * @param _accele    マウスから離れて行く時の加速値
    * @param _slowdown
    * @param _maxspeed
    */
    Path.prototype.setup = function (x, y, _accele, delayFrame, percent) {
      if (x === void 0) { x = 0; }
      if (y === void 0) { y = 0; }
      if (_accele === void 0) { _accele = 0.1; }
      if (delayFrame === void 0) { delayFrame = 0; }
      if (percent === void 0) { percent = 0.0; }
      this.prev2.x = this.prev.x = this.point.x = x;
      this.prev2.y = this.prev.y = this.point.y = y;
      this.delayFrame = delayFrame;
      this.percent = percent;
      //初期化
      this.vx = this.vy = 0.0;
      this.xx = innerWidth / 2 >> 0;
      this.yy = innerHeight / 2 >> 0;
      this.ac = _accele;
      this.de = 0.90;
      this.wd = 0.05;
      this.px0 = this.px1 = this.xx;
      this.py0 = this.py1 = this.yy;
    };
    Path.prototype.setMousePosition = function (x, y) {
      this.mouse.x = x;
      this.mouse.y = y;
    };
    Path.prototype.update = function () {
      this.prev2.x = this.prev.x;
      this.prev2.y = this.prev.y;
      this.prev.x = this.point.x;
      this.prev.y = this.point.y;
      // 参考
      // http://gihyo.jp/design/feature/01/frocessing/0004?page=1
      var px = this.xx;
      var py = this.yy;
      //加速度運動
      this.vx += (this.mouse.x - this.xx) * this.ac;
      this.vy += (this.mouse.y - this.yy) * this.ac;
      this.xx += this.vx;
      this.yy += this.vy;
      //新しい描画座標
      var x0 = px + this.vy * this.wd;
      var y0 = py - this.vx * this.wd;
      var x1 = px - this.vy * this.wd;
      var y1 = py + this.vx * this.wd;
      //描画座標
      this.px0 = x0;
      this.py0 = y0;
      this.px1 = x1;
      this.py1 = y1;
      //減衰処理
      this.vx *= this.de;
      this.vy *= this.de;
      this.point.x = this.xx;
      this.point.y = this.yy;
    };
    return Path;
  })();
})(project || (project = {}));

var stage, circle, line, background, bitmap, matrix2d, text, mtx, img, nodeNumber=100, nodeArray = [], linkArray = [], prevX=0, prevY=0, rotMag=5, count=0;

function setup(){
  stage = new createjs.Stage("spa-shell-opening-bg_canvas");
  stage.autoClear = false;
  text_message = new createjs.Text("This is generated by HTML5 ...", "64px Arial", "#eedcb3");
  text_message.alpha = 0.1;
  text_message.textBaseline = "alphabetic";
  text_message.x = (innerWidth - text_message.getBounds().width) / 2,
  text_message.y = (innerHeight - text_message.getBounds().height),
  text_message.rotation = -45;
  stage.addChild(text_message);
  for(var i=0; i<nodeNumber; ++i){
    var n = new Node();
    n.setup(0, 0, 0, 0, "rgba(0,0,0,0)");
    nodeArray.push(n);
  }
  text = new createjs.Text("", "16px Arial", "#ffff00");
  text.textBaseline = "alphabetic";
  text.alpha = 0.99;
  stage.addChild(text);
  background = new createjs.Shape();
  background.alpha = 0.03;
  img = new Image();
  img.src = "img/opening_bg.png";
  matrix2d = new createjs.Matrix2D(1,0,0,1,0,0);
  img.onload = function() {
    if(innerWidth/innerHeight>=img.width/img.height){
      matrix2d.a = matrix2d.d = innerWidth/img.width;
    }else{
      matrix2d.a = matrix2d.d = innerHeight/img.height;
    }
	  background.graphics.beginBitmapFill(img, "no-repeat", matrix2d).drawRect(0, 0, innerWidth, innerHeight).endFill();
  };
	stage.addChild(background);
  document.onwheel = handleMouseWheelRotation;
  handleResize();
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", stage);
  createjs.Ticker.addEventListener("tick", handleTick);
  window.onresize = handleResize;
}
function clean(){
  stage.removeAllChildren();
  stage.clear();
  nodeArray = [];
}
function handleTick(){
  var mouseX = stage.mouseX, mouseY = stage.mouseY, vx = mouseX - prevX, vy = mouseY - prevY,
  hi = Math.floor(255*Math.sqrt(vx*vx+vy*vy) / 60.0) % 6,
  f  = (255*Math.sqrt(vx*vx+vy*vy) / 60.0) - Math.floor(255*Math.sqrt(vx*vx+vy*vy) / 60.0),
  p  = Math.round(255 * (1.0 - (255 / 255.0))),
  q  = Math.round(255 * (1.0 - (255 / 255.0) * f)),
  t  = Math.round(255 * (1.0 - (255 / 255.0) * (1.0 - f))),
  red, green, blue;
  switch(hi){
    case 0:
      red = 255, green = t, blue = p;
      break;
    case 1:
      red = q, green = 255, blue = p;
      break;
    case 2:
      red = p, green = 255, blue = t;
      break;
    case 3:
      red = p, green = q, blue = 255;
      break;
    case 4:
      red = t, green = p, blue = 255;
      break;
    case 5:
      red = 255, green = p, blue = q;
      break;
    default:
      break;
  }
  text.x = mouseX, text.y = mouseY, text.text = Math.floor(mouseX) + " , " + Math.floor(mouseY) +  " , "  + Math.floor(100*rotMag);
  text_message.x = 10 * rotMag * (Math.random() - 0.5);
  text_message.y += 0.01 * (stage.mouseY - innerHeight / 2);
  if(text_message.y <= innerHeight / 2){
     text_message.y = innerHeight / 2;
  }else if(text_message.y >= innerHeight){
    text_message.y = innerHeight;
  }
  nodeArray[count].setup(mouseX, mouseY, vx, vy, "rgba("+red+","+green+","+blue+",0.1)");
  prevX = mouseX, prevY = mouseY;
  if(++count >= nodeNumber){
    count = 0;
  }
  nodeArray.forEach(updateForEach);
}
function handleResize() {
  stage.canvas.width = innerWidth,
  stage.canvas.height = innerHeight;
  text_message.x = (innerWidth - text_message.getBounds().width) / 2, text_message.y = (innerHeight - text_message.getBounds().height);
  background.graphics.clear();
  if(innerWidth/innerHeight>=img.width/img.height){
    matrix2d.a = matrix2d.d = innerWidth/img.width;
  }else{
    matrix2d.a = matrix2d.d = innerHeight/img.height;
  }
  background.graphics.beginBitmapFill(img, "no-repeat", matrix2d).drawRect(0, 0, innerWidth, innerHeight).endFill();
}
function handleMouseWheelRotation(e) {
  rotMag += 0.001*e.deltaY;
}
function updateForEach(element, index, array) {
  element.update();
}

var Node = (function () {
  function Node() {
    this.circle = new createjs.Shape();
    stage.addChild(this.circle);
    this.polystar = new createjs.Shape();
    this.polystar.graphics.setStrokeStyle(0);
    stage.addChild(this.polystar);
    this.polystar_big = new createjs.Shape();
    this.polystar_big.graphics.setStrokeStyle(0);
    stage.addChild(this.polystar_big);
  }
  Node.prototype.setup = function (x, y, vx, vy, color) {
    this.mag = Math.log(Math.sqrt(vx*vx+vy*vy)+1),
    this.vx = vx,
    this.vy = vy,
    this.circle.x = this.polystar.x = this.polystar_big.x = x,
    this.circle.y = this.polystar.y = this.polystar_big.y = y;
    this.circle.graphics.beginFill(color).drawCircle(0, 0, 4*this.mag);
    this.polystar.graphics.beginFill(color).drawPolyStar(0,0,0.2*this.mag,10,10,Math.PI/6);
    this.polystar_big.graphics.beginFill(color).drawPolyStar(0,0,0.6*this.mag,10,10,Math.PI/6);
    stage.setChildIndex (this.circle,nodeNumber);
    stage.setChildIndex (this.polystar,nodeNumber);
    stage.setChildIndex (this.polystar_big,nodeNumber);
  };
  Node.prototype.update = function () {
    this.vx *= 0.9,
    this.vy *= 0.9,
    this.circle.x += this.vx + 0.01 * (stage.mouseX - this.circle.x) + 0.003 * (stage.mouseX - innerWidth / 2) + this.mag*Math.sin(0.01*this.circle.y) + rotMag*Math.sin(2*Math.PI*(this.circle.y - stage.mouseY)/innerWidth),
    this.circle.y += this.vy + 0.01 * (stage.mouseY - this.circle.y) + 0.003 * (stage.mouseY - innerHeight / 2) + this.mag*Math.cos(0.01*this.circle.x) + rotMag*Math.cos(2*Math.PI*(this.circle.x - stage.mouseX)/innerHeight),
    this.polystar.x += this.vx + 0.01 * (stage.mouseX - this.circle.x) + this.mag*Math.sin(0.01*this.circle.y) + rotMag*Math.sin(2*Math.PI*(this.circle.y - stage.mouseY)/innerWidth) + 10 * (Math.random() - 0.5),
    this.polystar.y += this.vy + 0.01 * (stage.mouseY - this.circle.y) + this.mag*Math.cos(0.01*this.circle.x) + rotMag*Math.cos(2*Math.PI*(this.circle.x - stage.mouseX)/innerHeight) + 10 * (Math.random() - 0.5);
    this.polystar_big.x += this.vx + 0.01 * (stage.mouseX - this.circle.x) + this.mag*Math.sin(0.01*this.circle.y) + rotMag*Math.sin(2*Math.PI*(this.circle.y - stage.mouseY)/innerWidth) + 10 * (Math.random() - 0.5),
    this.polystar_big.y += this.vy + 0.01 * (stage.mouseY - this.circle.y) + this.mag*Math.cos(0.01*this.circle.x) + rotMag*Math.cos(2*Math.PI*(this.circle.x - stage.mouseX)/innerHeight) + 10 * (Math.random() - 0.5);
  };
  return Node;
})();
//# sourceMappingURL=main.js.map
