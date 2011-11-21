var io = require('socket.io').listen(8082);
io.set('log level', 1);
require('./PongServer.js');
require('./Paddle.js');
require('./Ball.js');
require('./Player.js');

// I use way too many globals here of course

var games = [];
var players = [];
var friendly_client_list = [];
var friendly_game_list = [];
var listsNeedUpdate = false;

io.sockets.on('connection', function (socket) 
{
	var player = new Player(socket);
	players.push(player);
	listsNeedUpdate = true;

	socket.on('setName', function(name) {
		player.name = name;
		listsNeedUpdate = true;
	});
	
	/*if(clientID%2 == 0)
	{
		games[gameCount] = new PongServer();
		games[gameCount].setLeftPaddleSocket(socket);
	}
	else
	{
		games[gameCount].setRightPaddleSocket(socket);
		gameCount++;
	}*/
});

setInterval(updateGameLists, 1500);

function updateGameLists()
{
	if(!listsNeedUpdate) return;
	
	for(var i in players)
	{
		if(!players[i].isPlaying) {
			players[i].socket.emit('updateGameList', serialize({users: players, games: friendly_game_list}));
		}
	}
	listsNeedUpdate = false;
}

function serialize(data) {
	var encoded = {};
	if(data.hasOwnProperty('serialize')) {
		encoded = data.serialize();
	}
	else {
		for(var i in data) {
			encoded[i] = serialize(data[i]);
		}
	}

	return encoded;
}