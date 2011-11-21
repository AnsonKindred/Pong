Object.extend = function()
{
	var new_class = function() {};
	var parent_class = new this();
	new_class.prototype = parent_class;
	for(var key in this) 
	{
		new_class[key] = this[key];
	}
	console.log(parent_class.lastTime);
	new_class.prototype.parent_class = parent_class;
	return new_class;
}