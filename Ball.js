Ball = function(px, py, vx, vy)
{
	this.circleBuffer = null;

	this.vx = vx
	this.vy = vy;
	this.px = px;
	this.py = py;

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
		drawBufferAtMode(this.circleBuffer, this.px, this.py, 0.0, gl.LINE_LOOP);
	}

	this.update = function(deltaTime)
	{
		this.px += this.vx*deltaTime;
		this.py += this.vy*deltaTime;
	}

}

Ball.RADIUS = .07;
Ball.SIDES  = 10.0;
Ball.STEP   = 2*Math.PI / Ball.SIDES;