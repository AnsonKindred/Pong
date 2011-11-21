var gl;
var shaderProgram;
var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;

function initGL(canvas)
{
	try
	{
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth  = canvas.width;
		gl.viewportHeight = canvas.height;
	}
	catch (e) {console.log(e);}

	if (!gl)
	{
		alert("Could not initialise WebGL, sorry :-(");
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	PongClient.init(gl);
}

function getShader(gl, id)
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript)
	{
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k)
	{
		if (k.nodeType == 3) // <- bad
		{
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment")
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} 
	else if (shaderScript.type == "x-shader/x-vertex")
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	} 
	else
	{
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function initShaders()
{
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function drawScene()
{
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	mat4.identity(mvMatrix);

	// Move the camera out a bit
    mat4.translate(mvMatrix, [-0, -0, -7]);

	PongClient.update();
	PongClient.draw(gl);
}

function handleKeyUp(e)
{
	var key = String.fromCharCode(e.keyCode);
	PongClient.keyUp(e, key);
}

function handleKeyDown(e)
{
	var key = String.fromCharCode(e.keyCode);
	PongClient.keyDown(e, key);
}

function tick()
{
	requestAnimFrame(tick);
	drawScene();
}

function webGLStart()
{
	var canvas = document.getElementById("pong");

	initGL(canvas);
	initShaders();

	document.onkeydown = handleKeyDown;
    document.onkeyup   = handleKeyUp;

	tick();
}

//----------------------------------------------------------------------------------------------------------------------

function setMatrixUniforms()
{
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function getBuffer(vertices)
{
	buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	buffer.itemSize = 3;
	buffer.numItems = vertices.length / 3;

	return buffer;
}

function pushMatrix()
{
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function popMatrix()
{
	if (mvMatrixStack.length == 0)
	{
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

function drawBufferAt(buffer, x, y, z)
{
	drawBufferAtMode(buffer, x, y, z, gl.TRIANGLE_STRIP);
}

function drawBufferAtMode(buffer, x, y, z, mode)
{
	pushMatrix();

	mat4.translate(mvMatrix, [x, y, z]);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	
	gl.drawArrays(mode, 0, buffer.numItems);

	popMatrix();
}

function time()
{
	return (new Date().valueOf());
}