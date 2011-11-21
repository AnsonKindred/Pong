Paddle = function(side)
{
	this.side = side;
	this.px = 0;
	this.py = 0;
	this.lastPaddleSend = 0;
	this.name = "";
	this.socket = null;

	if(this.side == 'left')
	{
		this.px = -Paddle.DISTANCE_FROM_CENTER;
	}
	else
	{
		this.px = Paddle.DISTANCE_FROM_CENTER;
	}
	
	// considered making this static but there's only 2 of them
	// and I may want to play with their vertices seperately
	this.paddleBuffer = null;

	this.moveSpeed = .01;
	this.moveUp    = false;
	this.moveDown  = false;

	this.init = function(gl)
	{
		var vertices = [
			 -Paddle.HALF_WIDTH, -Paddle.HALF_HEIGHT, 0,
			 Paddle.HALF_WIDTH, -Paddle.HALF_HEIGHT, 0,
			 -Paddle.HALF_WIDTH, Paddle.HALF_HEIGHT, 0,
			 Paddle.HALF_WIDTH, Paddle.HALF_HEIGHT, 0
		];

		this.paddleBuffer = getBuffer(vertices);
	}

	this.draw = function(gl)
	{
		drawBufferAtMode(this.paddleBuffer, this.px, this.py, 0.0, gl.TRIANGLE_STRIP);
	}

	this.update = function(deltaTime)
	{
		if(this.moveUp)
		{
			this.py += this.moveSpeed*deltaTime;
		}

		if(this.moveDown)
		{
			this.py -= this.moveSpeed*deltaTime;
		}

		if(this.moveUp || this.moveDown)
		{
			var deltaSend = time() - this.lastPaddleSend;
			if(this.lastPaddleSend == 0 || deltaSend > 5)
			{
				PongClient.SERVER.emit('movePaddle', this.py);
				this.lastPaddleSend = time();
			}
		}
	}

}

Paddle.HEIGHT = 1.0;
Paddle.WIDTH  = 0.1;
Paddle.HALF_WIDTH  = Paddle.WIDTH / 2.0;
Paddle.HALF_HEIGHT = Paddle.HEIGHT / 2.0;

Paddle.DISTANCE_FROM_CENTER = 3.5;