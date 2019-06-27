/* eslint no-console:0 consistent-return:0 */
"use strict";

// Globals
var program;
var vertices = [];
var engineInterval;
var enginePeriodMS = 100;
var paddleHeight = 0.05;
var paddleWidth = 0.15;
var ballWidth = 0.02;
var ballHeight = 0.04;
var ballVelocityX = 0.005;
var ballVelocityY = 0.01;
var ballPosX;
var ballPosY;
var topPaddlePosX;
var topPaddlePosY = 1 - paddleHeight;  
var bottomPaddlePosX;
var bottomPaddlePosY = -1;


// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function randomFloat(){
  return Math.random()*2.0 - 1.0;
}

// Fills the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
 
  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
 
  vertices.push.apply(vertices, [
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2])
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function onClickNewGame() {
  var canvas = document.getElementById("display");
  var gl = canvas.getContext("webgl");
  initGame(gl);
}

function onClickLeft() {
  bottomPaddlePosX -= 0.1;
  if(bottomPaddlePosX < -1){
    bottomPaddlePosX = -1;
  }
}

function onClickRight() {
  bottomPaddlePosX += 0.1;
  if(bottomPaddlePosX > 1 - paddleWidth){
    bottomPaddlePosX = 1 - paddleWidth;
  }
}

function autoTopPaddle() {
  if(ballPosX < topPaddlePosX + paddleWidth/2){
    topPaddlePosX -= 0.1;
    if(topPaddlePosX < -1){
      topPaddlePosX = -1;
    }
  }
  else if(ballPosX > topPaddlePosX + paddleWidth/2){
    topPaddlePosX += 0.1;
    if(topPaddlePosX > 1 - paddleWidth){
      topPaddlePosX = 1 - paddleWidth;
    }
  }
}

function onKeyPress(e) {
  console.log(e, e.code);
  switch(e.key){
    case "ArrowLeft":
      onClickLeft();
      break;
    case "ArrowRight":
      onClickRight();
      break;
  }
}
function initGame(gl)
{
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set a random color.
  var colorUniformLocation = gl.getUniformLocation(window.program, "u_color");
  gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

  vertices = [];
  topPaddlePosX = -paddleWidth/2;
  bottomPaddlePosX = -paddleWidth/2;
  ballPosX = -ballWidth/2;
  ballPosY = -ballHeight/2;

  drawPaddle(gl, topPaddlePosX, topPaddlePosY);
  drawPaddle(gl, bottomPaddlePosX, bottomPaddlePosY);
  drawBall(gl, ballPosX, ballPosY);

  // engineInterval = setInterval(runEngine, enginePeriodMS);
  runEngine();
}

function terminateGame(){
  console.log("terminateGame");
}

function drawGame(){
  var canvas = document.getElementById("display");
  var gl = canvas.getContext("webgl");
  vertices = [];
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawPaddle(gl, topPaddlePosX, topPaddlePosY);
  drawPaddle(gl, bottomPaddlePosX, bottomPaddlePosY);
  drawBall(gl, ballPosX, ballPosY);
  vertices = null;
}

function runEngine(){
  var canvas = document.getElementById("display");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  ballPosY -= ballVelocityY;
  ballPosX -= ballVelocityX;

  if(ballPosY <= -1 + paddleHeight &&
     ballPosX >= bottomPaddlePosX &&
     ballPosX <= bottomPaddlePosX + paddleWidth){
    ballVelocityY *= -1;
  }
  else if(ballPosY >= 1 - ballHeight - paddleHeight &&
          ballPosX >= topPaddlePosX &&
          ballPosX <= topPaddlePosX + paddleWidth){
    ballVelocityY *= -1;
  }
  else if(ballPosX >= 1 - ballWidth || ballPosX <= -1){
    ballVelocityX *= -1;
  }

  else if (ballPosY < -1 || ballPosY > 1){
    terminateGame();
    return;
  }

  document.querySelector("#ball_x").innerHTML = ballPosX;
  document.querySelector("#ball_y").innerHTML = ballPosY;

  autoTopPaddle();

  drawGame();
  requestAnimationFrame(runEngine);
}

// use convention position=topleft
function drawPaddle(gl, x, y) {
  setRectangle(gl, x, y, paddleWidth, paddleHeight);

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
}

function drawBall(gl, x, y) {

  setRectangle(gl, x, y, ballWidth, ballHeight);

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  // Get A WebGL context
  var canvas = document.getElementById("display");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  window.addEventListener("keydown", onKeyPress);

  // Get the strings for our GLSL shaders
  var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
  var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


  // code above this line is initialization code.
  // code below this line is rendering code.

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);
  var colorUniformLocation = gl.getUniformLocation(program, "u_color");
  gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);


  initGame(gl);

}

main();
