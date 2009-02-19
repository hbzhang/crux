Browser = Proto.clone().setSlots(
{
	userAgent: function()
	{
		if(typeof window != "undefined" && typeof window.navigator != "undefined")
		{
			return window.navigator.userAgent;
		}
		else
		{
			return "";
		}
	},
	
	isInternetExplorer: function()
	{
		return navigator.appName.indexOf("Internet Explorer") > -1;
	},
	
	isGecko: function()
	{
		this.userAgent().indexOf("Gecko") != -1;
	},
	
	version: function()
	{
		if(this.isGecko())
		{
			var index = USER_AGENT.indexOf("Firefox");
			return (index == -1) ? 2.0 : parseFloat(USER_AGENT.substring(index + "Firefox".length + 1));
		}
		else
		{
			return null;
		}
	}
})