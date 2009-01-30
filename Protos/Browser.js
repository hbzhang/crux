Browser = Proto.clone().setSlots(
{
	isInternetExplorer: function()
	{
		return navigator.appName.contains("Internet Explorer");
	}
})