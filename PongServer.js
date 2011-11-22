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

	this.moveLeftPaddle = function(position)
	{
		this.rightPlayer.socket.emit('enemyMoved', position);
		this.leftPaddle.py = position;
	}

	this.moveRightPaddle = function(position)
	{
		this.leftPlayer.socket.emit('enemyMoved', position);
		this.rightPaddle.py = position;
	}

	this.sync = function()
	{
		if(!this.hasStarted) return;
		
		var syncData = {
			x: this.ball.px,
			y: this.ball.py,
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
		var doSync = false;
		if(this.ball.px > GLOBAL.X_BOUND) {
			this.ball.px = GLOBAL.X_BOUND;
			this.ball.vx *= -1;
			doSync = true;
		}
		if(this.ball.px < -GLOBAL.X_BOUND) {
			this.ball.px = -GLOBAL.X_BOUND;
			this.ball.vx *= -1;
			doSync = true;
		}
		if(this.ball.py > GLOBAL.Y_BOUND) {
			this.ball.py = GLOBAL.Y_BOUND;
			this.ball.vy *= -1;
			doSync = true;
		}
		if(this.ball.py < -GLOBAL.Y_BOUND) {
			this.ball.py = -GLOBAL.Y_BOUND;
			this.ball.vy *= -1;
			doSync = true;
		}

		var top = 0;
		var bottom = 0;
		if(this.ball.px > GLOBAL.EDGE_OF_FIELD)
		{
			top    = this.rightPaddle.py - Paddle.HALF_HEIGHT;
			bottom = this.rightPaddle.py + Paddle.HALF_HEIGHT;
			if(this.ball.py > top && this.ball.py < bottom) {
				this.ball.vx *= -1;
				this.ball.px = GLOBAL.EDGE_OF_FIELD;
			}
			doSync = true;
		}

		if(this.ball.px < -GLOBAL.EDGE_OF_FIELD)
		{
			top    = this.leftPaddle.py - Paddle.HALF_HEIGHT;
			bottom = this.leftPaddle.py + Paddle.HALF_HEIGHT;
			if(this.ball.py > top && this.ball.py < bottom) {
				this.ball.vx *= -1;
				this.ball.px = -GLOBAL.EDGE_OF_FIELD;
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