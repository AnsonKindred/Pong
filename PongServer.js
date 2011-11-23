PongServer = function()
{
	this.leftPaddleSocket  = null;
	this.rightPaddleSocket = null;
	this.hasStarted = false;

	this.lastTime = 0;

	this.ball          = new Ball(0, 0, Math.random()/100.0, Math.random()/100.0);
	this.leftPaddle    = new Paddle('left');
	this.rightPaddle   = new Paddle('right');

	this.gameThreadID  = null;

	this.leftPaddle    = new Paddle('left');
	this.rightPaddle   = new Paddle('right');

	this.setLeftPlayer = function(player)
	{
		this.leftPlayer = player;
		this.leftPlayer.currentGame = this;
		this.leftPlayer.socket.emit('setPaddle', 'left');
		this.leftPlayer.socket.on('movePaddle', this.moveLeftPaddle.bind(this));
		this.leftPlayer.socket.on('sync', this.syncLeft.bind(this));
	}

	this.setRightPlayer = function(player)
	{
		this.rightPlayer = player;
		this.rightPlayer.currentGame = this;
		this.rightPlayer.socket.emit('setPaddle', 'right');
		this.rightPlayer.socket.on('movePaddle', this.moveRightPaddle.bind(this));
		this.rightPlayer.socket.on('sync', this.syncRight.bind(this));
	}

	this.moveLeftPaddle = function(moveState)
	{
		this.rightPlayer.socket.emit('enemyMoved', moveState);
		this.leftPaddle.y = moveState.y;
		this.leftPaddle.vy = moveState.vy;
		this.leftPaddle.moveSpeed = moveState.moveSpeed;
	}

	this.moveRightPaddle = function(moveState)
	{
		this.leftPlayer.socket.emit('enemyMoved', moveState);
		this.rightPaddle.y = moveState.y;
		this.rightPaddle.vy = moveState.vy;
		this.rightPaddle.moveSpeed = moveState.moveSpeed;
	}

	this.syncLeft = function(data)
	{
		this.rightPlayer.socket.emit('errorCorrect', data);
	}

	this.syncRight = function(data)
	{
		this.leftPlayer.socket.emit('errorCorrect', data);
	}

	this.start = function()
	{
		this.hasStarted = true;
		this.leftPlayer.socket.emit('start', {vx: this.ball.vx, vy: this.ball.vy});
		this.rightPlayer.socket.emit('start', {vx: this.ball.vx, vy: this.ball.vy});
		console.log("A game is starting");
	}

	this.stop = function()
	{
		Server.gameEnded(this);
		this.leftPlayer.currentGame = null;
		this.rightPlayer.currentGame = null;
	}

	this.playerDisconnected = function(player)
	{
		// for now just going to stop the game, but I imagine
		// at some point this could be handled better
		this.stop();
	}
}

PongServer.time = function()
{
	return (new Date().valueOf());
}