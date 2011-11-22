PongServer = function()
{
	this.leftPaddleSocket = null;
	this.rightPaddleSocket = null;
	this.hasStarted = false;

	this.lastTime = 0;

	this.ball        = new Ball(0, 0, Math.random()/100.0, Math.random()/100.0);
	this.leftPaddle  = new Paddle('left');
	this.rightPaddle = new Paddle('right');

	this.gameThreadID = null;

	this.leftPaddle  = new Paddle('left');
	this.rightPaddle  = new Paddle('right');

	this.setLeftPlayer = function(player)
	{
		this.leftPlayer = player;
		this.leftPlayer.currentGame = this;
		this.leftPlayer.socket.emit('setPaddle', 'left');
		this.leftPlayer.socket.on('movePaddle', this.moveLeftPaddle.bind(this));
	}

	this.setRightPlayer = function(player)
	{
		this.rightPlayer = player;
		this.rightPlayer.currentGame = this;
		this.rightPlayer.socket.emit('setPaddle', 'right');
		this.rightPlayer.socket.on('movePaddle', this.moveRightPaddle.bind(this));
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
		this.rightPaddle.moveSpeed = moveState.moveSpeed;
	}

	this.sync = function()
	{
		if(!this.hasStarted) return;
		
		var syncData = {
			x: this.ball.x,
			y: this.ball.y,
			vx: this.ball.vx,
			vy: this.ball.vy
		}
		this.lastTime = PongServer.time();
		this.leftPlayer.socket.emit('sync', syncData);
		this.rightPlayer.socket.emit('sync', syncData);
	}

	this.start = function()
	{
		this.gameThreadID = setInterval(this.update.bind(this), GLOBAL.SIMULATION_RATE);
		this.hasStarted = true;
	}

	this.stop = function()
	{
		clearInterval(this.gameThreadID);
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

	this.update = function()
	{
		if(!this.hasStarted)
		{
			if(this.leftPlayer !== null && this.rightPlayer !== null)
			{
				this.lastTime = PongServer.time();
				this.hasStarted = true;
			}
			return;
		}
		
		var curTime = PongServer.time();
		var deltaTime = curTime - this.lastTime;
		this.lastTime = curTime;
		
		this.ball.update(deltaTime);
		this.leftPaddle.update(deltaTime);
		this.rightPaddle.update(deltaTime);
		
		var doSync = false;
		if(this.ball.x > GLOBAL.X_BOUND) {
			this.ball.x = GLOBAL.X_BOUND;
			this.ball.vx *= -1;
			doSync = true;
		}
		if(this.ball.x < -GLOBAL.X_BOUND) {
			this.ball.x = -GLOBAL.X_BOUND;
			this.ball.vx *= -1;
			doSync = true;
		}
		if(this.ball.y > GLOBAL.Y_BOUND) {
			this.ball.y = GLOBAL.Y_BOUND;
			this.ball.vy *= -1;
			doSync = true;
		}
		if(this.ball.y < -GLOBAL.Y_BOUND) {
			this.ball.y = -GLOBAL.Y_BOUND;
			this.ball.vy *= -1;
			doSync = true;
		}

		var top = 0;
		var bottom = 0;
		if(this.ball.x > GLOBAL.EDGE_OF_FIELD)
		{
			top    = this.rightPaddle.y - Paddle.HALF_HEIGHT;
			bottom = this.rightPaddle.y + Paddle.HALF_HEIGHT;
			if(this.ball.y > top && this.ball.y < bottom) {
				this.ball.vx *= -1;
				this.ball.x = GLOBAL.EDGE_OF_FIELD;
			}
			doSync = true;
		}

		if(this.ball.x < -GLOBAL.EDGE_OF_FIELD)
		{
			top    = this.leftPaddle.y - Paddle.HALF_HEIGHT;
			bottom = this.leftPaddle.y + Paddle.HALF_HEIGHT;
			if(this.ball.y > top && this.ball.y < bottom) {
				this.ball.vx *= -1;
				this.ball.x = -GLOBAL.EDGE_OF_FIELD;
			}
			doSync = true;
		}

		if(doSync)
		{
			this.sync();
		}
	}
}

PongServer.time = function()
{
	return (new Date().valueOf());
}