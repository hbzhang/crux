Number.prototype.setSlots(
{
	milliseconds: function()
	{
		return this;
	},
	
	repeat: function(callback)
	{
		for(var i = 0; i < this; i++)
		{
			callback(i);
		}
		return this;
	},

	isEven: function()
	{
		return this % 2 == 0;
	}
});