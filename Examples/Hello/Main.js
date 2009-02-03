Importer.importPath("Protos/Hello", function()
{
	window.onload = function()
	{
		Hello.clone().setFirstName("Crux").setLastName("User").sayHello();
	}
});