PongController = Object.extend();

PongController.prototype.ball = null;
PongController.prototype.leftPaddle = null;
PongController.prototype.rightPaddle = null;

PongController.prototype.lastTime = 0;
PongController.prototype.gameStarted = false;

PongController.prototype.start = function() {alert("Parent");}
PongController.prototype.userSetName = function(event) {}
PongController.prototype.updateGameList = function(lists) {}
PongController.prototype.setPaddle = function(side) {}
PongController.prototype.sync = function(data) {}
PongController.prototype.update = function() {}

PongController.X_BOUND = 3.8;
PongController.Y_BOUND = 2.8;
PongController.EDGE_OF_FIELD = Paddle.DISTANCE_FROM_CENTER - Paddle.HALF_WIDTH - Ball.RADIUS;

