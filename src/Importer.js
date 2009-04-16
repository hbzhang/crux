Importer = Proto.clone().setType("Importer")
.setSlots(
{
	importPaths: function()
	{
		this._imports = [];
		this._scriptPaths = [];
		
		for(var i = 0; i < arguments.length; i++)
		{
			var pathMap = arguments[i];
			for(var name in pathMap)
			{
				var path = pathMap[name];
			}
			
			this._imports.push(Import.clone().setName(name).setPath(path));
		}
		
		var importsCopy = Array.prototype.slice.call(this._imports);
		for(var i = 0; i < importsCopy.length; i ++)
		{
			importsCopy[i].start();
		}
	},
	
	addScriptTag: function(path, loadCallback)
	{
		var scriptElement = document.createElement("script");
		scriptElement.type = "text/javascript";
		if(loadCallback)
		{
			scriptElement.onload = function(){ loadCallback() }
			scriptElement.onreadystatechange = function()
			{
				if(scriptElement.readyState == "loaded") { loadCallback() }
			}
		}
		scriptElement.src = path;

		document.getElementsByTagName("head")[0].appendChild(scriptElement);
	},
	
	importedList: function(listName, importNames)
	{
		for(var i = 0; i < this._imports.length; i ++)
		{
			var anImport = this._imports[i];
			
			if(anImport.name() == listName)
			{
				this.importCompleted(anImport.setIsComplete(true).setImportNames(importNames));
				break;
			}
		}
	},
	
	importCompleted: function(anImport)
	{
		if(this._imports[0] == anImport)
		{
			while(this._imports.length && this._imports[0].isComplete())
			{
				var nextImport = this._imports.shift();
				var importNames = nextImport.importNames();
				for(var i = 0; i < importNames.length; i ++)
				{
					var importName = importNames[i];
					if(!(nextImport.name() == "Crux" && (importName == "Proto" || importName == "Importer")))
					{
						this._scriptPaths.push(nextImport.path() + "/" + importName + ".js");
					}
				}
			}
		}
		
		this.appendNextScriptTag();
	},
	
	appendNextScriptTag: function()
	{
		if(this._scriptLoading){ return };
		
		var scriptPath = this._scriptPaths.shift();
		if(scriptPath)
		{
			this._scriptLoading = true;
			var self = this;
			this.addScriptTag(scriptPath, function()
			{
				self._scriptLoading = false;
				self.appendNextScriptTag();
			});
		}
	}
});

Import = Proto.clone().setType("Import")
.newSlots("path", "name", "importNames")
.newSlot("isComplete", false)
.setSlots(
{
	start: function()
	{
		Importer.addScriptTag(this._path + "/Import.js");
	},
	
	matchesListName: function(listName)
	{
		
	}
});