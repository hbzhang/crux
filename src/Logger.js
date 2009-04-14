Logger = Proto.clone().setType("Logger")
.setSlots(
{
	log: function()
	{
		console.log.apply(console, arguments);
	},
	
	warn: function()
	{
		console.warn.apply(console, arguments);
	},
	
	error: function()
	{
		console.error.apply(console, arguments);
	},
	
	disable: function()
	{
		this.log = function(){}
		this.warn = function(){}
		this.error = function(){}
	}
});

if(ENVIRONMENT == "production") Logger.disable();