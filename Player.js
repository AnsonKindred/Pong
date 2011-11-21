Player = function(socket, name)
{
	this.socket = socket;
	this.name = name;
	this.isPlaying = false;

	this.serialize = function()
	{
		return {name: this.name, isPlaying: this.isPlaying};
	}
}
