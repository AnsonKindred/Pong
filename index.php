<html>
	<head>
		<title>Zeb.Pong</title>
		<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">

		<script id="shader-fs" type="x-shader/x-fragment">
			#ifdef GL_ES
			precision highp float;
			#endif

			void main(void) {
				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
			}
		</script>

		<script id="shader-vs" type="x-shader/x-vertex">
			attribute vec3 aVertexPosition;

			uniform mat4 uMVMatrix;
			uniform mat4 uPMatrix;

			void main(void) {
				gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
			}
		</script>

		<script type="text/javascript" src="http://50.57.111.104:8082/socket.io/socket.io.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js" type="text/javascript"></script>
		<script type="text/javascript" src="include.js"></script>
		<script type="text/javascript" src="lib/webgl-util.js"></script>
		<script type="text/javascript" src="lib/glMatrix.js"></script>
		<script type="text/javascript" src="Ball.js"></script>
		<script type="text/javascript" src="Paddle.js"></script>
		<script type="text/javascript" src="base/Object.js"></script>
		<script type="text/javascript" src="base/PongController.js"></script>
		<script type="text/javascript" src="client/PongClient.js"></script>
		<script type="text/javascript" src="glInit.js"></script>

		<link rel="stylesheet" type="text/css" href="css/main.css" />
	</head>

	<body onload="webGLStart();">
		<div class="canvas">
			<canvas id="pong" style="border: none;" width="800" height="600"></canvas>
		</div>
		<div class="main-title">
			<h1>pong</h1>
			<div class="author">by<br/>Zeb Long</div>
			<label for="username">Name</label>
			<input class="username" name="username" />
		</div>
		<div class="users">

		</div>
		<div class="games">
			
		</div>
	</body>
</html>

