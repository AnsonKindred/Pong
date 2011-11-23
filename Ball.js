Ball = function(x, y, vx, vy)
{
	this.circleBuffer = null;

	this.vx = vx
	this.vy = vy;
	this.x = x;
	this.y = y;

	this.init = function(gl)
	{
		var vertices = [];
		var v_count = 0;
		
		for(var i = 0; i <= 2*Math.PI; i += Ball.STEP)
		{
			var x = Ball.RADIUS*Math.cos(i);
			var y = Ball.RADIUS*Math.sin(i);
			vertices[v_count] = x;v_count++;
			vertices[v_count] = y;v_count++;
			vertices[v_count] = 0;v_count++;
		}

		this.circleBuffer = getBuffer(vertices);
	}

	this.draw = function(gl)
	{
		drawBufferAtMode(this.circleBuffer, this.x, this.y, 0.0, gl.LINE_LOOP);
	}

	this.update = function(deltaTime)
	{
		//this.x += this.vx*deltaTime;
		//this.y += this.vy*deltaTime;
		var nextPos = Ball.calculatePosition(this, deltaTime);
		this.x = nextPos.x;
		this.y = nextPos.y;
		this.vx = nextPos.vx;
		this.vy = nextPos.vy;
		this.didCollide = nextPos.didCollide;
	}

	this.setParams = function(data)
	{
		this.x = data.x;
		this.y = data.y;
		this.vx = data.vx;
		this.vy = data.vy;
	}

}

Ball.RADIUS = .07;
Ball.SIDES  = 10.0;
Ball.STEP   = 2*Math.PI / Ball.SIDES;

Ball.predict = function(data, time)
{
	if(time > 0)
	{
		return {
			x: data.x + data.vx*time,
			y: data.y + data.vy*time,
			vx: data.vx,
			vy: data.vy
		};
	}
	else
	{
		return data;
	}
}


Ball.calculatePosition = function(ball, time)
{
	if(time > 50) {
		console.log("just checking");
		time = 50;
	}
	var data = {
			x: ball.x,
			y: ball.y,
			vx: ball.vx,
			vy: ball.vy
		}
	if(time <= 0) return data;
	for(var i = 0; i < time; i++)
	{
		data.x += data.vx;
		data.y += data.vy;
	}

	data.didCollide = false;
	if(data.x > GLOBAL.X_BOUND)
	{
		data.x = GLOBAL.X_BOUND;
		data.vx *= -1;
		data.didCollide = true;
	}
	if(data.x < -GLOBAL.X_BOUND)
	{
		data.x = -GLOBAL.X_BOUND;
		data.vx *= -1;
		data.didCollide = true;
	}
	if(data.y > GLOBAL.Y_BOUND)
	{
		data.y = GLOBAL.Y_BOUND;
		data.vy *= -1;
		data.didCollide = true;
	}
	if(data.y < -GLOBAL.Y_BOUND)
	{
		data.y = -GLOBAL.Y_BOUND;
		data.vy *= -1;
		data.didCollide = true;
	}

	var top = 0;
	var bottom = 0;
	if(data.x > GLOBAL.EDGE_OF_FIELD)
	{
		top    = PongClient.rightPaddle.y - Paddle.HALF_HEIGHT;
		bottom = PongClient.rightPaddle.y + Paddle.HALF_HEIGHT;
		if(data.y > top && data.y < bottom) {
			data.vx *= -1;
			data.x = GLOBAL.EDGE_OF_FIELD;
			data.didCollide = true;
		}
	}

	if(data.x < -GLOBAL.EDGE_OF_FIELD)
	{
		top    = PongClient.leftPaddle.y - Paddle.HALF_HEIGHT;
		bottom = PongClient.leftPaddle.y + Paddle.HALF_HEIGHT;
		if(data.y > top && data.y < bottom) {
			data.vx *= -1;
			data.x = -GLOBAL.EDGE_OF_FIELD;
			data.didCollide = true;
		}
	}

	return data;
}