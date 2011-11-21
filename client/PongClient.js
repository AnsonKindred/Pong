PongClient = PongController.extend();

PongClient.prototype.start = function()
{
	console.log(this);
	alert("child");
	this.parent_class.start();
}

var bla = new PongClient();
bla.start();

PongClient.X_BOUND = 3.8;
PongClient.Y_BOUND = 2.8;
PongClient.EDGE_OF_FIELD = Paddle.DISTANCE_FROM_CENTER - Paddle.HALF_WIDTH - Ball.RADIUS;

PongClient.ball = null;
PongClient.myPaddle = null;
PongClient.enemyPaddle = null;
PongClient.leftPaddle = null;
PongClient.rightPaddle = null;

PongClient.lastTime = 0;
PongClient.gameStarted = false;

PongClient.init = function(gl)
{
	PongClient.ball = new Ball(0, 0, 0, 0);
	PongClient.ball.init(gl);

	PongClient.leftPaddle  = new Paddle('left');
	PongClient.leftPaddle.init(gl);

	PongClient.rightPaddle = new Paddle('right');
	PongClient.rightPaddle.init(gl);
	$('input.username').keypress(PongClient.userSetName);
}

PongClient.userSetName = function(event)
{
	if(event.which == 13)
	{
		PongClient.SERVER.emit('setName', $(this).val());
	}
}

PongClient.updateGameList = function(lists)
{
	console.log(lists);
	$('div.users').empty();
	for(var i in lists.users) {
		$('div.users').append("<div>"+lists.users[i].name+"</div>");
	}
}

PongClient.setPaddle = function(side)
{
	if(side == 'left')
	{
		PongClient.myPaddle = PongClient.leftPaddle;
		PongClient.enemyPaddle = PongClient.rightPaddle;
	}
	else
	{
		PongClient.myPaddle = PongClient.rightPaddle;
		PongClient.enemyPaddle = PongClient.leftPaddle;
	}
}

PongClient.enemyMoved = function(position)
{
	PongClient.enemyPaddle.py = position;
}

PongClient.sync = function(data)
{
	PongClient.gameStarted = true;
	PongClient.lastTime = time();
	PongClient.ball.px = data.x;
	PongClient.ball.py = data.y;
	PongClient.ball.vx = data.vx;
	PongClient.ball.vy = data.vy;
}

PongClient.draw = function(gl)
{
	PongClient.ball.draw(gl);
	PongClient.leftPaddle.draw(gl);
	PongClient.rightPaddle.draw(gl);
}

PongClient.update = function()
{
	if(!PongClient.gameStarted) return;

	var curTime = time();
	var deltaTime = curTime - PongClient.lastTime;
	PongClient.lastTime = curTime;

	PongClient.ball.update(deltaTime);
	PongClient.leftPaddle.update(deltaTime);
	PongClient.rightPaddle.update(deltaTime);

	/*if(PongClient.ball.px > PongClient.X_BOUND) {
		PongClient.ball.px = PongClient.X_BOUND;
		PongClient.ball.vx *= -1;
	}
	if(PongClient.ball.px < -PongClient.X_BOUND) {
		PongClient.ball.px = -PongClient.X_BOUND;
		PongClient.ball.vx *= -1;
	}
	if(PongClient.ball.py > PongClient.Y_BOUND) {
		PongClient.ball.py = PongClient.Y_BOUND;
		PongClient.ball.vy *= -1;
	}
	if(PongClient.ball.py < -PongClient.Y_BOUND) {
		PongClient.ball.py = -PongClient.Y_BOUND;
		PongClient.ball.vy *= -1;
	}

	var top = 0;
	var bottom = 0;
	if(PongClient.ball.px > PongClient.EDGE_OF_FIELD)
	{
		top    = PongClient.rightPaddle.py - Paddle.HALF_HEIGHT;
		bottom = PongClient.rightPaddle.py + Paddle.HALF_HEIGHT;
		if(PongClient.ball.py > top && PongClient.ball.py < bottom) {
			PongClient.ball.vx *= -1;
			PongClient.ball.px = PongClient.EDGE_OF_FIELD;
		}
	}

	if(PongClient.ball.px < -PongClient.EDGE_OF_FIELD)
	{
		top    = PongClient.leftPaddle.py - Paddle.HALF_HEIGHT;
		bottom = PongClient.leftPaddle.py + Paddle.HALF_HEIGHT;
		if(PongClient.ball.py > top && PongClient.ball.py < bottom) {
			PongClient.ball.vx *= -1;
			PongClient.ball.px = -PongClient.EDGE_OF_FIELD;
		}
	}*/
}

PongClient.keyDown = function(e, key)
{
	if(!PongClient.gameStarted) return;
	PongClient.myPaddle.moveUp   = (key == "W" || e.keyCode == 38) ? true : PongClient.myPaddle.moveUp;
	PongClient.myPaddle.moveDown = (key == "S" || e.keyCode == 40) ? true : PongClient.myPaddle.moveDown;
}

PongClient.keyUp = function(e, key)
{
	if(!PongClient.gameStarted) return;
	PongClient.myPaddle.moveUp   = (key == "W" || e.keyCode == 38) ? false : PongClient.myPaddle.moveUp;
	PongClient.myPaddle.moveDown = (key == "S" || e.keyCode == 40) ? false : PongClient.myPaddle.moveDown
}

PongClient.SERVER = io.connect('http://50.57.111.104:8082');
PongClient.SERVER.on('updateGameList', PongClient.updateGameList);
PongClient.SERVER.on('setPaddle', PongClient.setPaddle);
PongClient.SERVER.on('enemyMoved', PongClient.enemyMoved);
PongClient.SERVER.on('sync', PongClient.sync);