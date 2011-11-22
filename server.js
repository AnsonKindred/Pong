var io = require('socket.io').listen(8082);
io.set('log level', 1);
require('./PongServer.js');
require('./Paddle.js');
require('./Ball.js');
require('./Player.js');
require('./GLOBALS.js');

Server = function(){}

Server.games = [];
Server.players = [];
Server.friendly_client_list = [];
Server.friendly_game_list = [];
Server.listsNeedUpdate = false;

//setInterval(updateGameLists, 1500);

Server.newClient = function(socket)
{
	var player = new Player(socket);
	Server.players.push(player);
	Server.listsNeedUpdate = true;

	socket.on('setName', function(name) {
		player.name = name;
		Server.listsNeedUpdate = true;
	});

	if(Server.players.length%2 == 1)
	{
		var game = new PongServer();
		Server.games.push(game);
		Server.games[Server.games.length-1].setLeftPlayer(player);
	}
	else
	{
		Server.games[Server.games.length-1].setRightPlayer(player);
		Server.games[Server.games.length-1].start();
	}

	socket.on('disconnect', function(){
		player.disconnect();
	});
}

Server.gameEnded = function(game)
{
	var index = Server.games.indexOf(game);
	Server.games.splice(index, 1);
}

Server.updateGameLists = function()
{
	if(!Server.listsNeedUpdate) return;

	for(var i in Server.players)
	{
		if(!Server.players[i].isPlaying)
		{
			Server.players[i].socket.emit(
					'updateGameList',
					Server.serialize({
						users: Server.players,
						games: Server.friendly_game_list
					})
				);
		}
	}
	Server.listsNeedUpdate = false;
}

Server.serialize = function(data)
{
	var encoded = {};
	if(data.hasOwnProperty('serialize')) {
		encoded = data.serialize();
	}
	else {
		for(var i in data) {
			encoded[i] = Server.serialize(data[i]);
		}
	}

	return encoded;
}

io.sockets.on('connection', Server.newClient);
