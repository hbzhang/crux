Importer = Proto.clone().setType("Importer")
.newSlot("path", "")
.setSlot("_imports", [])
.setSlot("_importedPaths", [])
.setSlot("_currentPathIndex", 0)
.setSlot("_currentPath", "")
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
			//console.log("pathToImport: " + pathToImport);
			if(!this.hasImportedPath(pathToImport))
			{
				this._importedPaths.push(pathToImport);
				this.addRemainingPath(pathToImport);
				
				if(!this._currentPath)
				{
					this._currentPath = pathToImport;
				}
				
				this.addPathToImport(pathToImport, anImport);
				
				document.write("<script type='text/javascript' src='" + pathToImport + ".js' onload='Importer.importedPath(\"" + pathToImport + "\")'></script>");
			};
		}
		
		return this;
	},
	
	addPathToImport: function(path, anImport)
	{
		anImport.addPath(path);
		
		var imports = this._imports[path];
		if(!imports)
		{
			imports = [];
			//console.log("adding imports at " + pathToImport);
			this._imports[path] = imports;
		}
		imports.push(anImport);
	},
	
	addRemainingPath: function(remainingPath)
	{
		var currentPathImports = this._imports[this._currentPath];
		if(currentPathImports)
		{
			//console.log("addining remaining path " + remainingPath + " at " + this._currentPath);
			for(var i = 0; i < currentPathImports.length; i ++)
			{
				var anImport = currentPathImports[i];
				//console.log("anImport._remainingPaths: " + anImport._remainingPaths.join(","));
				//console.log("anImport._completionCallback: " + anImport._completionCallback);
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
		//console.log("importedPath: " + path);
		//console.log("this._importedPaths: " + this._importedPaths.join(","));
		this._currentPathIndex ++;
		if(this._importedPaths[this._currentPathIndex])
		{
			this._currentPath = this._importedPaths[this._currentPathIndex];
			var pathComponents = this._currentPath.split("/");
			this._path = pathComponents.slice(0, pathComponents.length - 1).join("/");
		}
		
		var incompleteImports = []
		if(this._imports[path])
		{
			var imports = this._imports[path];
			for(var i = 0; i < imports.length; i ++)
			{
				var anImport = imports[i];
				//console.log(anImport._completionCallback);
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
		//console.log("importedPath: " + path);
		//console.log("this._remainingPaths: " + this._remainingPaths.join(","));
		//console.log("this._remainingPaths.length: " + this._remainingPaths.length);
		//console.log("this._completionCallback: " + this._completionCallback);
		if(!this._remainingPaths.length && this._completionCallback)
		{
			//console.log("_completionCallback");
			this._completionCallback()
		}
		return this;
	},
	
	isComplete: function()
	{
		return !this._remainingPaths.length;
	}
})