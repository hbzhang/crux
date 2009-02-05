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
			if(name == "Crux" && (path == "Proto" || path == "Importer")){ continue }
			
			this._imports.push(Import.clone().setName(name).setPath(path));
		}
		
		var importsCopy = Array.prototype.slice.call(this._imports);
		window.onload = function()
		{
			for(var i = 0; i < importsCopy.length; i ++)
			{
				importsCopy[i].start();
			}
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
				this.importCompleted(anImport.setComplete(true).setImportNames(importNames));
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
					this._scriptPaths.push(nextImport.path() + "/" + importNames[i] + ".js");
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
Browser = Proto.clone().setSlots(
{
	isInternetExplorer: function()
	{
		return navigator.appName.indexOf("Internet Explorer") > -1;
	}
})
if(!window.console)
{
	console = Proto.clone()
	.newSlot("isEnabled", true)
	.setSlots(
	{
		log: function(message)
		{
			if(this._isEnabled)
			{
				if(document.body)
				{
					this.appendMessageElement(message);
				}
				else
				{
					alert("log: " + message);
				}
			}
		},
		
		warn: function(message)
		{
			if(this._isEnabled)
			{
				if(document.body)
				{
					this.appendMessageElement(message);
					var e = this.appendMessageElement(message);
					e.style.color = "#FFFF00";
					e.style.background = "#666666";
				}
				else
				{
					alert("warn: " + message);
				}
			}
		},
		
		error: function(message)
		{
			if(this._isEnabled)
			{
				if(document.body)
				{
					this.appendMessageElement(message);
					var e = this.appendMessageElement(message);
					e.style.color = "#FF0000";
				}
				else
				{
					alert("error: " + message);
				}
			}
		},
		
		appendMessageElement: function(message)
		{
			this.initConsoleElement();
			var entryElement = document.createElement("div");
			entryElement.innerText = message.toString();
			this._consoleElement.appendChild(entryElement);
			this._consoleElement.scrollTop = this._consoleElement.scrollHeight;
			
			return entryElement;
		},
		
		initConsoleElement: function()
		{
			if(!this._consoleElement)
			{
				var e = document.createElement("div");
				var style = e.style;
				style.position = "absolute";
				style.x = 0;
				style.y = 0;
				style.width = 200;
				style.height = 400;
				style.zIndex = 2000;
				style.background = "#FFFFFF";
				style.border = "1px solid #666666";
				style.overflow = "auto";
				style.font = "11px 'Verdana'";
				
				document.body.appendChild(e);
				
				this._consoleElement = e;
			}
		}
	});
}
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
	
	append: function(e)
	{
		this.push(e);
		return this;
	},
	
	prepend: function(e)
	{
		this.unshift(e);
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
