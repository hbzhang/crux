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
		
		//if(Browser.isGecko() && window.console) return;
		
		if(!window.console)
		{
			window.console = {};
		}
		
		window.console.log = function(){};
		window.console.warn = function(){};
		window.console.error = function(){};
	}
});

if(window.ENVIRONMENT == "production") Logger.disable();