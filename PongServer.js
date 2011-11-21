PongServer = function()
{
	this.X_BOUND = 3.8;
	this.Y_BOUND = 2.8;
	
	this.EDGE_OF_FIELD = Paddle.DISTANCE_FROM_CENTER - Paddle.HALF_WIDTH - Ball.RADIUS;
	this.leftPaddleSocket = null;
	this.rightPaddleSocket = null;
	this.hasStarted = false;

	this.lastTime = 0;

	this.ball        = new Ball(0, 0, Math.random()/100.0, Math.random()/100.0);
	this.leftPaddle  = new Paddle('left');
	this.rightPaddle = new Paddle('right');

	this.gameThreadID = null;

	this.setLeftPaddleSocket = function(socket)
	{
		this.leftPaddleSocket = socket;
		this.leftPaddleSocket.emit('setPaddle', 'left');
		this.leftPaddleSocket.on('movePaddle', this.moveLeftPaddle.bind(this));
	}

	this.setRightPaddleSocket = function(socket)
	{
		this.rightPaddleSocket = socket;
		this.rightPaddleSocket.emit('setPaddle', 'right');
		this.rightPaddleSocket.on('movePaddle', this.moveRightPaddle.bind(this));
	}

	this.moveLeftPaddle = function(position)
	{
		this.rightPaddleSocket.emit('enemyMoved', position);
		this.leftPaddle.py = position;
	}

	this.moveRightPaddle = function(position)
	{
		this.leftPaddleSocket.emit('enemyMoved', position);
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
		this.leftPaddleSocket.emit('sync', syncData);
		this.rightPaddleSocket.emit('sync', syncData);
	}

	this.start = function()
	{
		this.gameThreadID = setInterval(this.update.bind(this), 20);
	}

	this.stop = function()
	{
		clearInterval(this.gameThreadID);
	}

	this.update = function()
	{
		if(!this.hasStarted)
		{
			if(this.leftPaddleSocket !== null && this.rightPaddleSocket !== null)
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
		if(this.ball.px > this.X_BOUND) {
			this.ball.px = this.X_BOUND;
			this.ball.vx *= -1;
			doSync = true;
		}
		if(this.ball.px < -this.X_BOUND) {
			this.ball.px = -this.X_BOUND;
			this.ball.vx *= -1;
			doSync = true;
		}
		if(this.ball.py > this.Y_BOUND) {
			this.ball.py = this.Y_BOUND;
			this.ball.vy *= -1;
			doSync = true;
		}
		if(this.ball.py < -this.Y_BOUND) {
			this.ball.py = -this.Y_BOUND;
			this.ball.vy *= -1;
			doSync = true;
		}

		var top = 0;
		var bottom = 0;
		if(this.ball.px > this.EDGE_OF_FIELD)
		{
			top    = this.rightPaddle.py - Paddle.HALF_HEIGHT;
			bottom = this.rightPaddle.py + Paddle.HALF_HEIGHT;
			if(this.ball.py > top && this.ball.py < bottom) {
				this.ball.vx *= -1;
				this.ball.px = this.EDGE_OF_FIELD;
			}
			doSync = true;
		}

		if(this.ball.px < -this.EDGE_OF_FIELD)
		{
			top    = this.leftPaddle.py - Paddle.HALF_HEIGHT;
			bottom = this.leftPaddle.py + Paddle.HALF_HEIGHT;
			if(this.ball.py > top && this.ball.py < bottom) {
				this.ball.vx *= -1;
				this.ball.px = -this.EDGE_OF_FIELD;
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