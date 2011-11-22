Paddle = function(side)
{
	this.side = side;
	this.x  = 0;
	this.y  = 0;
	this.vx = 0;
	this.vy = 0;
	this.isPlayer = false;

	if(this.side == 'left')
	{
		this.x = -Paddle.DISTANCE_FROM_CENTER;
	}
	else
	{
		this.x = Paddle.DISTANCE_FROM_CENTER;
	}
	
	this.paddleBuffer = null;

	this.moveSpeed = .01;
	this.moveUp    = false;
	this.moveDown  = false;
	this.lastMoveState = 0;

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
		drawBufferAtMode(this.paddleBuffer, this.x, this.y, 0.0, gl.TRIANGLE_STRIP);
	}

	this.update = function(deltaTime)
	{
		this.y += this.vy*deltaTime;
	}

	this.keyDown = function(e, key)
	{
		this.moveUp   = (key == "W" || e.keyCode == 38) ? true : PongClient.myPaddle.moveUp;
		this.moveDown = (key == "S" || e.keyCode == 40) ? true : PongClient.myPaddle.moveDown;
		if((this.moveUp && this.moveDown) || (!this.moveUp && !this.moveDown))
		{
			this.vy = 0;
		}
		else if(this.moveUp)
		{
			this.vy = this.moveSpeed;
		}
		else //if(this.moveDown)
		{
			this.vy = -this.moveSpeed
		}
		PongClient.SERVER.emit(
				'movePaddle',
				{
					y: this.y,
					vy: this.vy,
					moveSpeed: this.moveSpeed
				}
			);
	}

	this.keyUp = function(e, key)
	{
		this.moveUp   = (key == "W" || e.keyCode == 38) ? false : PongClient.myPaddle.moveUp;
		this.moveDown = (key == "S" || e.keyCode == 40) ? false : PongClient.myPaddle.moveDown;
		if((this.moveUp && this.moveDown) || (!this.moveUp && !this.moveDown))
		{
			this.vy = 0;
		}
		else if(this.moveUp)
		{
			this.vy = this.moveSpeed;
		}
		else //if(this.moveDown)
		{
			this.vy = -this.moveSpeed
		}
		PongClient.SERVER.emit(
				'movePaddle',
				{
					y: this.y,
					vy: this.vy,
					moveSpeed: this.moveSpeed
				}
			);
	}
}

Paddle.HEIGHT = 1.0;
Paddle.WIDTH  = 0.1;
Paddle.HALF_WIDTH  = Paddle.WIDTH / 2.0;
Paddle.HALF_HEIGHT = Paddle.HEIGHT / 2.0;

Paddle.DISTANCE_FROM_CENTER = 3.5;