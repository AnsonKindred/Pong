PongClient = function() {}

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
	//console.log(lists);
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
	PongClient.myPaddle.isPlayer = true;
}

PongClient.enemyMoved = function(moveState)
{
	PongClient.enemyPaddle.py = moveState.y;
	PongClient.enemyPaddle.vy = moveState.vy;
	PongClient.enemyPaddle.moveSpeed = moveState.moveSpeed;
}

PongClient.sync = function(data)
{
	PongClient.gameStarted = true;
	PongClient.lastTime = time();
	PongClient.ball.x = data.x;
	PongClient.ball.y = data.y;
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

	/*if(PongClient.ball.x > PongClient.X_BOUND) {
		PongClient.ball.x = PongClient.X_BOUND;
		PongClient.ball.vx *= -1;
	}
	if(PongClient.ball.x < -PongClient.X_BOUND) {
		PongClient.ball.x = -PongClient.X_BOUND;
		PongClient.ball.vx *= -1;
	}
	if(PongClient.ball.y > PongClient.Y_BOUND) {
		PongClient.ball.y = PongClient.Y_BOUND;
		PongClient.ball.vy *= -1;
	}
	if(PongClient.ball.y < -PongClient.Y_BOUND) {
		PongClient.ball.y = -PongClient.Y_BOUND;
		PongClient.ball.vy *= -1;
	}

	var top = 0;
	var bottom = 0;
	if(PongClient.ball.x > PongClient.EDGE_OF_FIELD)
	{
		top    = PongClient.rightPaddle.y - Paddle.HALF_HEIGHT;
		bottom = PongClient.rightPaddle.y + Paddle.HALF_HEIGHT;
		if(PongClient.ball.y > top && PongClient.ball.y < bottom) {
			PongClient.ball.vx *= -1;
			PongClient.ball.x = PongClient.EDGE_OF_FIELD;
		}
	}

	if(PongClient.ball.x < -PongClient.EDGE_OF_FIELD)
	{
		top    = PongClient.leftPaddle.y - Paddle.HALF_HEIGHT;
		bottom = PongClient.leftPaddle.y + Paddle.HALF_HEIGHT;
		if(PongClient.ball.y > top && PongClient.ball.y < bottom) {
			PongClient.ball.vx *= -1;
			PongClient.ball.x = -PongClient.EDGE_OF_FIELD;
		}
	}*/
}

PongClient.keyDown = function(e, key)
{
	if(!PongClient.gameStarted) return;
	PongClient.myPaddle.keyDown(e, key);
}

PongClient.keyUp = function(e, key)
{
	if(!PongClient.gameStarted) return;
	PongClient.myPaddle.keyUp(e, key);
}

PongClient.SERVER = io.connect('http://50.57.111.104:8082');
PongClient.SERVER.on('updateGameList', PongClient.updateGameList);
PongClient.SERVER.on('setPaddle', PongClient.setPaddle);
PongClient.SERVER.on('enemyMoved', PongClient.enemyMoved);
PongClient.SERVER.on('sync', PongClient.sync);