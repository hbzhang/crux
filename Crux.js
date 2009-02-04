
/***************************** Proto *****************************/


if (!Array.prototype.forEach)
{
	Array.prototype.forEach = function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in this)
				fun.call(thisp, this[i], i, this);
		}
	};
}

String.prototype.asCapitalized = function()
{
	return this.replace(/\b[a-z]/g, function(match){
		return match.toUpperCase();
	});
};

Proto = new Object;

Proto.setSlot = function(name, value)
{
	this[name] = value;
	return this;
};

Proto.uniqueIdCounter = 0;

Proto.setSlots = function(slots)
{
	for(name in slots)
	{
		if(slots.hasOwnProperty(name))
			this.setSlot(name, slots[name]);
	}
	if(slots.hasOwnProperty("toString"))
		this.toString = slots.toString;
	return this;
};

Proto.setSlots(
{
	clone: function()
	{
		var constructor = new Function;
		constructor.prototype = this;
		
		var obj = new constructor;
		obj._proto = this;
		obj._uniqueId = ++ Proto.uniqueIdCounter;
		if(obj.init)
			obj.init();
		return obj
	},
	
	uniqueId: function()
	{
		return this._uniqueId;
	},
	
	proto: function()
	{
		return this._proto;
	},
	
	removeSlots: function()
	{
		this.argsAsArray(arguments).forEach(function(slotName)
		{
			delete this["_" + name];
			delete this[name];
			delete this["set" + name.asCapitalized()];
		});
		
		return this;
	},
	
	setSlotsIfAbsent: function(slots)
	{
		for(name in slots)
		{
			if(!this[name] && slots.hasOwnProperty(name))
				this.setSlot(name, slots[name]);
		}
		if(slots.hasOwnProperty("toString"))
			this.toString = slots.toString;
		return this;
	},
	
	newSlot: function(name, initialValue)
	{
		if(initialValue === undefined) { initialValue = null };
		
		this["_" + name] = initialValue;
		this[name] = function()
		{
			return this["_" + name];
		}
		this["set" + (name.indexOf("is") == 0 ? name.slice(2) : name).asCapitalized()] = function(newValue)
		{
			this["_" + name] = newValue;
			return this;
		}
		return this;
	},

	argsAsArray: function(args)
	{
		return Array.prototype.slice.call(args);
	},

	newSlots: function()
	{
		this.argsAsArray(arguments).forEach(function(slotName)
		{
			this.newSlot(slotName);
		}, this);
		return this;
	},

	newNumberSlot: function(name, initialValue)
	{
		this.newSlot(name, initialValue || 0);
		this["inc" + name.asCapitalized() + "By"] = function(amount)
		{
			this["_" + name] += amount;
		}
		this["inc" + name.asCapitalized()] = function()
		{
			this["_" + name] ++;
		}
		this["dec" + name.asCapitalized() + "By"] = function(amount)
		{
			this["_" + name] -= amount;
		}
		this["dec" + name.asCapitalized()] = function()
		{
			this["_" + name] --;
		}
		return this;
	},
	
	newNumberSlots: function()
	{
		this.argsAsArray(arguments).forEach(function(slotName)
		{
			this.newNumberSlot(slotName);
		}, this);
		return this;
	},
	
	forEachSlot: function(callback)
	{
		for(var slotName in this)
		{
			if(this.hasOwnProperty(slotName))
			{
				callback(this[slotName], slotName);
			}
		}
		return this;
	}
});

Proto.newSlot("type", "Proto");
Proto.removeSlot = Proto.removeSlots;

for(slotName in Proto)
{
	[Array, String, Number, Date].forEach(function(contructorFunction)
	{
		contructorFunction.prototype[slotName] = Proto[slotName];
		contructorFunction.clone = function()
		{
			return new contructorFunction;
		}
	});
}


/***************************** Importer *****************************/


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


/***************************** Array *****************************/


Array.prototype.setSlotsIfAbsent(
{
	isEmpty: function()
	{
		return this.length == 0;
	},
	
	concatInPlace: function(anArray)
	{
		this.push.apply(this, anArray);
	},

	at: function(index)
	{
		if(index > 0)
		{
			return this[index];
		}
		else
		{
			return this[this.length + index];
		}
	},
	
	removeElements: function(elements)
	{
		elements.forEach(function(e){ this.remove(e) }, this);
		return this;
	},
	
	remove: function(e)
	{
		var i = this.indexOf(e);
		if(i > 0)
		{
			this.removeAt(i);
		}
		return this;
	},

	removeAt: function(i)
	{
		this.splice(i, 1);
		return this;
	},

	copy: function()
	{
		return this.slice();
	},

	first: function()
	{
		return this[0];
	},

	last: function()
	{
		return this[this.length - 1];
	},

	pushIfAbsent: function(value)
	{
		if(this.indexOf(value) == -1)
		{
			this.push(value);
		}
		return this;
	},

	split: function(subArrayCount)
	{
		var subArrays = [];

		var subArraySize = Math.ceil(this.length / subArrayCount);
		for(var i = 0; i < this.length; i += subArraySize)
		{
			var subArray = this.slice(i, i + subArraySize);
			if(subArray.length < subArraySize)
			{
				var lastSubArray = subArrays.pop();
				if(lastSubArray)
				{
					subArray = lastSubArray.concat(subArray);
				}
			}
			subArrays.push(subArray);
		}

		return subArrays;
	},

	map: function(fun /*, thisp*/)
	{
		var len = this.length;
		if(typeof fun != "function")
			throw new TypeError();

		var res = new Array(len);
		var thisp = arguments[1];
		for(var i = 0; i < len; i++)
		{
			if (i in this)
				res[i] = fun.call(thisp, this[i], i, this);
		}

		return res;
	},

	shuffle: function()
	{
		var i = this.length;
		if(i == 0) return false;
		while (-- i)
		{
			var j = Math.floor(Math.random() * ( i + 1 ));
			var tempi = this[i];
			var tempj = this[j];
			this[i] = tempj;
			this[j] = tempi;
		}
	},

	forEachCall: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		this.forEach(function(e, i)
		{
			args[args.length - 1] = i;
			e[functionName].apply(e, args);
		});
		return this;
	},

	sortByCalling: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		return this.sort(function(x, y)
		{
			return x[functionName].apply(functionName, args) < y[functionName].apply(functionName, args);
		});
	},

	mapByCalling: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		return this.map(function(e, i)
		{
			args[args.length - 1] = i;
			return e[functionName].apply(e, args);
		});
	},

	detectByCalling: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		return this.detect(function(e, i)
		{
			return e[functionName].apply(e, args);
		});
	},

	reduce: function(fun /*, initial*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1)
			throw new TypeError();

		var i = 0;
		if (arguments.length >= 2)
		{
			var rv = arguments[1];
		}
		else
		{
			do
			{
				if (i in this)
				{
					rv = this[i++];
					break;
				}

				// if array contains no values, no initial value to return
				if (++i >= len)
					throw new TypeError();
				}
			while (true);
		}

		for (; i < len; i++)
		{
			if (i in this)
				rv = fun.call(null, rv, this[i], i, this);
		}

		return rv;
	},

	filter: function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var res = new Array();
		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
	    {
			if (i in this)
			{
				var val = this[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, this))
					res.push(val);
			}
		}

		return res;
	},

	detect: function(callback)
	{
		for(var i = 0; i < this.length; i++)
		{
			if(callback(this[i]))
			{
				return this[i];
			}
		}

		return null;
	},

	detectIndex: function(callback)
	{
		for(var i = 0; i < this.length; i++)
		{
			if(callback(this[i]))
			{
				return i;
			}
		}

		return null;
	},

	some: function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in this && fun.call(thisp, this[i], i, this))
				return true;
		}

		return false;
	},

	every: function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in this && !fun.call(thisp, this[i], i, this))
				return false;
		}

		return true;
	},

	indexOf: function(elt /*, from*/)
	{
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0)
			? Math.ceil(from)
			: Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++)
		{
			if (from in this &&
				this[from] === elt)
			return from;
		}
		return -1;
	},

	contains: function(element)
	{
		return this.indexOf(element) > -1;
	}
});


/***************************** Browser *****************************/


Browser = Proto.clone().setSlots(
{
	isInternetExplorer: function()
	{
		return navigator.appName.contains("Internet Explorer");
	}
})


/***************************** String *****************************/


String.prototype.setSlotsIfAbsent(
{
	repeated: function(times)
	{
		var result = "";
		var aString = this;
		times.repeat(function(){ result += aString });
		return result
	},
	
	isEmpty: function()
	{
		return this.length == 0;
	},

	beginsWith: function(prefix)
	{
		return this.indexOf(prefix) == 0;
	},

	removePrefix: function(prefix)
	{
		return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
	},

	endsWith: function(suffix)
	{
		return this.lastIndexOf(suffix) == this.length - suffix.length;
	},

	removeSuffix: function(suffix)
	{
		if(this.endsWith(suffix))
		{
			return this.substr(0, this.length - suffix.length);
		}
		else
		{
			return this;
		}
	},

	trim: function()
	{
		return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},

	hostName: function()
	{
		var result = this.removePrefix("http://");
		return result.slice(0, result.indexOf("/"));
	},
	
	contains: function(aString)
	{
		return this.indexOf(aString) > -1;
	},
	
	asUncapitalized: function()
	{
		return this.replace(/\b[A-Z]/g, function(match){
			return match.toLowerCase();
		});
	}
});


/***************************** Number *****************************/


Number.prototype.setSlots(
{
	milliseconds: function()
	{
		return this;
	},
	
	repeat: function(callback)
	{
		for(var i = 0; i < this; i++)
		{
			callback(i);
		}
		return this;
	},

	isEven: function()
	{
		return this % 2 == 0;
	}
});


/***************************** Interval *****************************/


Interval = Proto.clone().newSlots("lowerBound", "excludesLowerBound", "upperBound", "excludesUpperBound").setSlots(
{
	init: function()
	{
		this._lowerBound = -Infinity;
		this._upperBound = Infinity;
	},

	withBounds: function(lowerBound, upperBound)
	{
		return this.clone().setLowerBound(lowerBound).setUpperBound(upperBound);
	},

	includes: function(value)
	{
		return this.lowerBoundIncludes(value) && this.upperBoundIncludes(value);
	},

	lowerBoundIncludes: function(value)
	{
		if(value == null)
			return false;

		return this._excludesLowerBound ? value > this._lowerBound : value >= this._lowerBound;
	},

	upperBoundIncludes: function(value)
	{
		if(value == null)
			return false;

		return this._excludesUpperBound ? value < this._upperBound : value <= this._upperBound;
	},

	forEach: function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		if(this._lowerBound > this._upperBound || this._lowerBound == null || this._upperBound == null)
			throw new Error("invalid bounds");


		var thisp = arguments[1];
		var start = this._lowerBound + (this._excludesLowerBound ? 1 : 0);
		var end = this._upperBound - (this._excludesUpperBound ? 0 : 1);
		for (var i = start; i < end; i++)
		{
			fun.call(thisp, i, i, this);
		}
	},

	toString: function()
	{
		return (this.excludesLowerBound ? "(" : "[") + this._lowerBound + "," + this._upperBound + (this.excludesUpperBound ? ")" : "]");
	}
});


/***************************** Uri *****************************/


Uri = Proto.clone().newSlot("protocol", "http").newSlots("hostname", "port", "path", "queryString", "fragment").setSlots(
{
	withString: function(uriString)
	{
		/* parseUri attributed to Steven Levithan
		 * http://blog.stevenlevithan.com/archives/parseuri
		 */
		function parseUri (str) {
			var	o   = parseUri.options,
				m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
				uri = {},
				i   = 14;

			while (i--) uri[o.key[i]] = m[i] || "";

			uri[o.q.name] = {};
			uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
				if ($1) uri[o.q.name][$1] = $2;
			});

			return uri;
		};

		parseUri.options = {
			strictMode: false,
			key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
			q:   {
				name:   "queryKey",
				parser: /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: {
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		};
		
		uriComponents = parseUri(uriString);
		
		return Uri.clone()
			.setProtocol(uriComponents.protocol)
			.setHostname(uriComponents.host)
			.setPort(uriComponents.port.isEmpty() ? null : uriComponents.port)
			.setPath(uriComponents.path)
			.setQueryString(uriComponents.query.isEmpty() ? null : uriComponents.query)
			.setFragment(uriComponents.anchor.isEmpty() ? null : uriComponents.anchor);
	},
	
	toString: function()
	{
		var uriString = this._protocol + "://" + this._hostname;
		if(this._port)
			uriString += ":" + this._port;
		uriString += this._path;
		if(this._queryString)
			uriString += "?" + this._queryString;
		if(this._fragment)
			uriString += "#" + this._fragment;
		return uriString;
	}
});
