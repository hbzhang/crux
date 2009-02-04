Importer = Proto.clone().setType("Importer")
.newSlot("path", "")
.setSlot("_imports", [])
.setSlot("_importedPaths", [])
.setSlot("_currentPathIndex", 0)
.setSlots(
{
	importPaths: function()
	{
		var pathsToImport = this.argsAsArray(arguments);
		
		var completionCallback = pathsToImport.pop();
		
		if(completionCallback && typeof(completionCallback) != "function")
		{
			pathsToImport.push(completionCallback);
			completionCallback = null;
		}

		var basePath = this._path;
		if(basePath && basePath[basePath.length - 1] != "/"){ basePath += "/" };
		
		var anImport = Import.clone().setCompletionCallback(completionCallback);
		for(var i = 0; i < pathsToImport.length; i ++)
		{
			var pathToImport = basePath + pathsToImport[i];
			if(!this.hasImportedPath(pathToImport))
			{
				this._importedPaths.push(pathToImport);
				this.addRemainingPath(pathToImport);
				
				this.addPathToImport(pathToImport, anImport);
				
				document.write("<script type='text/javascript' src='" + pathToImport + ".js' onload='Importer.importedPath(\"" + pathToImport + "\")'></script>");
			};
		}
		
		this.setPathFromCurrentPath();
		
		return this;
	},
	
	setPathFromCurrentPath: function()
	{
		var currentPath = this.currentPath();
		if(currentPath)
		{
			var pathComponents = currentPath.split("/");
			this._path = pathComponents.slice(0, pathComponents.length - 1).join("/");
		}
	},
	
	currentPath: function()
	{
		return this._importedPaths[this._currentPathIndex];
	},
	
	addPathToImport: function(path, anImport)
	{
		anImport.addPath(path);
		
		var imports = this._imports[path];
		if(!imports)
		{
			imports = [];
			this._imports[path] = imports;
		}
		imports.push(anImport);
	},
	
	addRemainingPath: function(remainingPath)
	{
		var currentPath = this.currentPath();
		var currentPathImports = this._imports[currentPath];
		if(currentPathImports)
		{
			for(var i = 0; i < currentPathImports.length; i ++)
			{
				var anImport = currentPathImports[i];
				this.addPathToImport(remainingPath, anImport);
			}
		}
	},
	
	appendPath: function(path)
	{
		var basePath = this._path;
		if(basePath && basePath[basePath.length - 1] != "/"){ basePath += "/" };
		
		this._path = basePath + path;
		
		return this;
	},
	
	hasImportedPath: function(path)
	{
		return this._importedPaths.indexOf(path) > -1;
	},
	
	importedPath: function(path)
	{
		this._currentPathIndex ++;
		
		this.setPathFromCurrentPath();
		
		var incompleteImports = []
		if(this._imports[path])
		{
			var imports = this._imports[path];
			for(var i = 0; i < imports.length; i ++)
			{
				var anImport = imports[i];
				if(!anImport.importedPath(path).isComplete()){ incompleteImports.push(anImport) }
			}
		}
		
		this._imports[path] = incompleteImports;
	}
});

Importer.setSlot("importPath", Importer.importPaths);

Import = Proto.clone().setType("Import")
.newSlot("completionCallback")
.newSlot("remainingPaths")
.setSlots(
{
	init: function()
	{
		this._remainingPaths = [];
	},
	
	addPath: function(path)
	{
		this._remainingPaths.push(path);
	},
	
	importedPath: function(path)
	{
		var pathIndex = this._remainingPaths.indexOf(path);
		if(pathIndex > -1)
		{
			this._remainingPaths.splice(pathIndex, 1);
		}
		if(!this._remainingPaths.length && this._completionCallback)
		{
			this._completionCallback()
		}
		return this;
	},
	
	isComplete: function()
	{
		return !this._remainingPaths.length;
	}
})