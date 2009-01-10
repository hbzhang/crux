/****************************** Prototype ******************************/

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

Prototype = new Object;

Prototype.setSlot = function(name, value)
{
	this[name] = value;
	return this;
};

Prototype.setSlots = function(slots)
{
	for(name in slots)
	{
		this.setSlot(name, slots[name]);
	}
	return this;
};

Prototype.setSlots(
{
	clone: function()
	{
		var constructor = new Function;
		constructor.prototype = this;
		obj = new constructor;
		if(obj.init)
			obj.init();
		return obj
	},
	
	setSlotsIfAbsent: function(slots)
	{
		for(name in slots)
		{
			if(!this[name])
			{
				this.setSlot(name, slots[name]);
			}
		}
		return this;
	},
	
	newSlot: function(name, initialValue)
	{
		this["_" + name] = initialValue;
		this[name] = function()
		{
			return this["_" + name];
		}
		this["set" + name.asCapitalized()] = function(newValue)
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
	}
});

for(slotName in Prototype)
{
	[Array, String, Number, Date].forEach(function(contructorFunction)
	{
		contructorFunction.prototype[slotName] = Prototype[slotName];
		contructorFunction.clone = function()
		{
			return new contructorFunction;
		}
	});
}


/****************************** Importer ******************************/


Importer = Prototype.clone().newSlot("basePath", "/").setSlots(
{
	ImportState: Prototype.clone().newSlot("completionCallback").newNumberSlots("importCount").setSlots(
	{
		init: function()
		{
			this._importedCount = 0;
		},

		completeImport: function()
		{
			this._importedCount ++;
			if(this._importCount == this._importedCount)
			{
				this._completionCallback();
			}
		}
	}),
	
	_importedPaths: {},
	
	init: function()
	{
		this._importedPaths = {};
	},
	
	importPaths: function()
	{
		var pathsToImport = Array.prototype.slice.call(arguments);
		
		var importState = typeof pathsToImport[pathsToImport.length - 1] == "function" ? this.ImportState.clone().setCompletionCallback(pathsToImport.pop()) : null;
		
		
		for(var i = 0; i < pathsToImport.length; i ++)
		{
			var pathToImport = this._basePath + pathsToImport[i];
			
			if(importState)
				importState.incImportCount();

			if(this._importedPaths[pathToImport])
			{
				importState.completeImport();
			}
			else
			{
				this._importedPaths[pathToImport] = true;
				
				var scriptElement = document.createElement("script");
				scriptElement.language = "javascript";
				scriptElement.type = "text/javascript";
				if(importState)
				{
					scriptElement.onload = function()
					{
						importState.completeImport();
					};
				}
				scriptElement.src = pathToImport + ".js";
				document.getElementsByTagName('head').item(0).appendChild(scriptElement);
			}
		}
		return this;
	},
	
	addImportedPaths: function()
	{
		for(var i = 0; i < arguments.length; i ++)
		{
			this._importedPaths[this._basePath + path] = true;
		}
		return this;
	}
});

Importer.setSlot("importPath", Importer.importPaths);

/****************************** Array ******************************/

Array.prototype.setSlotsIfAbsent(
{
	removeElements: function(elements)
	{
		elements.forEach(function(e)
		{
			var i = this.indexOf(e);
			if(i > 0)
			{
				this.removeAt(i);
			}
		}, this);
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

/****************************** Number ******************************/

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
	}
});

/****************************** LocationMonitor ******************************/

LocationMonitor = Prototype.clone().newSlot("period", (200).milliseconds()).setSlots(
{
	init: function()
	{
		this._changeListeners = [];
	},
	
	start: function()
	{
		
	}
});

/****************************** Interval ******************************/

Interval = Prototype.clone().newSlots("lowerBound", "excludesLowerBound", "upperBound", "excludesUpperBound").setSlots(
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

/****************************** String ******************************/

String.prototype.setSlotsIfAbsent(
{
	repeated: function(times)
	{
		var result = "";
		var aString = this;
		times.repeat(function(){ result += aString });
		return result
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
	}
});