Browser = Proto.clone().setSlots(
{
	isInternetExplorer: function()
	{
		return navigator.appName.indexOf("Internet Explorer") > -1;
	}
})