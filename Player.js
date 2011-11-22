Player = function(socket, name)
{
	this.socket = socket;
	this.name = name;
	this.isPlaying = false;
	this.currentGame = null;

	this.disconnect = function()
	{
		if(this.currentGame)
		{
			this.currentGame.playerDisconnected(this);
		}
	}

	this.serialize = function()
	{
		return {name: this.name, isPlaying: this.isPlaying};
	}
}
