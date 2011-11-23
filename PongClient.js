PongClient = function() {}

PongClient.ball = new Ball(0, 0, 0, 0);
PongClient.myPaddle = null;
PongClient.enemyPaddle = null;
PongClient.leftPaddle = null;
PongClient.rightPaddle = null;

PongClient.lastTime = 0;
PongClient.gameStarted = false;
PongClient.gameStartTime = 0;
PongClient.stupidSyncCount = 0;

PongClient.init = function(gl)
{
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
	PongClient.enemyPaddle.y = moveState.y;
	PongClient.enemyPaddle.vy = moveState.vy;
	PongClient.enemyPaddle.moveSpeed = moveState.moveSpeed;
}

PongClient.start = function(data)
{
	PongClient.ball.vx = data.vx;
	PongClient.ball.vy = data.vy;

	PongClient.gameStartTime = time();
	PongClient.gameStarted = true;
	PongClient.lastTime = time();
}

PongClient.sync = function()
{
	if(!PongClient.gameStarted) return;
	var gameTime = time() - PongClient.gameStartTime;
	var syncData = {
		x: PongClient.ball.x,
		y: PongClient.ball.y,
		vx: PongClient.ball.vx,
		vy: PongClient.ball.vy,
		time: gameTime
	}

	PongClient.SERVER.emit('sync', syncData);
}

PongClient.errorCorrect = function(data)
{
	var gameTime = time() - PongClient.gameStartTime;
	if(gameTime-data.time < 20)
		PongClient.ball.setParams(Ball.calculatePosition(data, gameTime-data.time));
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
	PongClient.stupidSyncCount++;

	// Whichever side the ball is on is the master
	if(((PongClient.myPaddle.side == 'left' && PongClient.ball.x < 0) ||
		(PongClient.myPaddle.side == 'right' && PongClient.ball.x > 0)) && PongClient.stupidSyncCount >= 20)
	{
		PongClient.sync();
		PongClient.stupidSyncCount = 0;
	}
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
PongClient.SERVER.on('start', PongClient.start);
PongClient.SERVER.on('errorCorrect', PongClient.errorCorrect);
