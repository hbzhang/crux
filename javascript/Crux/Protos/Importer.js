Importer = Proto.clone().newSlot("basePath", "/").setSlots(
{
	importPaths: function()
	{
		var pathsToImport = Array.prototype.slice.call(arguments);
		
		/*
		var completionCallback = pathsToImport.pop();
		if(typeof(completionCallback) != "function")
		{
			pathsToImport.push(completionCallback);
			completionCallback = null;
		}
		*/

		var importCount = pathsToImport.length;
		
		while(pathsToImport.length)
		{
		    var basePath = this._basePath;
		    if(basePath[this._basePath.length - 1] != "/")
		        basePath += "/";
		        
		    var pathToImport = basePath + pathsToImport.shift();
		    
			/*
		    var scriptElement = document.createElement("script");
			scriptElement.language = "javascript";
			scriptElement.type = "text/javascript";
			scriptElement.src = pathToImport + ".js";
			
			if(completionCallback)
			{
				scriptElement.onload = function()
				{
					importCount --;
					if(importCount == 0)
					{
						completionCallback();
					}
				}
			}
			
			document.getElementsByTagName('head').item(0).appendChild(scriptElement);
			*/
			
			document.write("<script type='text/javascript' src='" + pathToImport + ".js'></script>");
		}
		
		return this;
	}
});

Importer.setSlot("importPath", Importer.importPaths);