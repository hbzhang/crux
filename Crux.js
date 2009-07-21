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

Proto_constructor = new Function;

Proto.setSlots(
{
	constructor: new Function,
	
	clone: function()
	{
		Proto_constructor.prototype = this;
		
		var obj = new Proto_constructor;
		obj._proto = this;
		obj._uniqueId = ++ Proto.uniqueIdCounter;
		if(obj.init)
			obj.init();
		return obj;
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
	
	printSlotCalls: function()
	{
		var calls = [];
		for(var name in SlotCalls)
		{
		  var o = {};
		  o.name = name;
		  o.count = SlotCalls[name];
		  calls.push(o);
		}
		calls.sort(function(x, y){ return x.count - y.count });
		for(var i = 0; i < calls.length; i ++)
		{
		  Logger.log(calls[i].name + ":" + calls[i].count);
		}
	},
	
	newSlot: function(name, initialValue)
	{
		if(typeof(name) != "string") throw "name must be a string";
		/*
		if(!window.SlotCalls)
		{
			window.SlotCalls = {};
		}
		*/
		if(initialValue === undefined) { initialValue = null };
		
		this["_" + name] = initialValue;
		this[name] = function()
		{
			/*
			if(SlotCalls[name] === undefined)
			{
				SlotCalls[name] = 0;
			}
			SlotCalls[name] ++;
			*/
			return this["_" + name];
		}
		
		this["set" + name.asCapitalized()] = function(newValue)
		{
			this["_" + name] = newValue;
			return this;
		}
		return this;
	},
	
	aliasSlot: function(slotName, aliasName)
	{
		this[aliasName] = this[slotName];
		this["set" + aliasName.asCapitalized()] = this["set" + slotName.asCapitalized()];
		return this;
	},

	argsAsArray: function(args)
	{
		return Array.prototype.slice.call(args);
	},

	newSlots: function()
	{
		var args = this.argsAsArray(arguments);

		var slotsMap = {};
		
		if(args.length > 1 || typeof(args[0]) == "string")
		{
			args.forEach(function(slotName)
			{
				slotsMap[slotName] = null;
			})
		}
		else
		{
			slotsMap = args[0];
		}
		
		for(slotName in slotsMap)
		{
			this.newSlot(slotName, slotsMap[slotName]);
		}
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
	},
	
	performWithArgList: function(message, argList)
	{
		return this[message].apply(this, argList);
	},
	
	perform: function(message)
	{
		return this[message].call(this, this.argsAsArray(arguments).slice(1));
	}
});

Proto.newSlot("type", "Proto");
Proto.removeSlot = Proto.removeSlots;
Browser = Proto.clone().setSlots(
{
	userAgent: function()
	{
		if(typeof window != "undefined" && typeof window.navigator != "undefined")
		{
			return window.navigator.userAgent;
		}
		else
		{
			return "";
		}
	},
	
	isInternetExplorer: function()
	{
		return navigator.appName.indexOf("Internet Explorer") > -1;
	},
	
	isIE8: function()
	{
		return this.userAgent().indexOf("MSIE 8.0") != -1;
	},
	
	isIE6: function()
	{
		return this.isInternetExplorer() && !window.XMLHttpRequest;
	},
	
	isGecko: function()
	{
		return this.userAgent().indexOf("Gecko") != -1;
	},
	
	isSafari: function()
	{
		return this.userAgent().indexOf("Safari") != -1;
	},
	
	version: function()
	{
		if(this.isGecko())
		{
			var index = this.userAgent().indexOf("Firefox");
			return (index == -1) ? 2.0 : parseFloat(this.userAgent().substring(index + "Firefox".length + 1));
		}
		else
		{
			return null;
		}
	},
	
	locationAsUri: function()
	{
		return Uri.withString(window.location.href);
	}
})
for(slotName in Proto)
{
	[Array, String, Number, Date].forEach(function(contructorFunction)
	{
		if(contructorFunction == Array && slotName == "clone" && Browser.isInternetExplorer())
		{
			contructorFunction.prototype[slotName] = function(){ throw new Error("You can't clone an Array proto in IE yet.") };
		}
		else
		{
			contructorFunction.prototype[slotName] = Proto[slotName];
		}
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
if(!window.console)
{
	console = Proto.clone()
	.setSlots(
	{
		log: function()
		{
			var message = this.argsAsArray(arguments).join("");
			if(document.body)
			{
				this.appendMessageElement(message);
			}
			else
			{
				alert("log: " + message);
			}
		},
		
		warn: function(message)
		{
			if(document.body)
			{
				var e = this.appendMessageElement(message);
				e.style.color = "#FFFF00";
				e.style.background = "#666666";
			}
			else
			{
				alert("warn: " + message);
			}
		},
		
		error: function(message)
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
		},
		
		appendMessageElement: function(message)
		{
			this.initConsoleElement();
			var entryElement = document.createElement("div");
			entryElement.style.position = "static";
			//entryElement.innerText = message.toString();
			entryElement.innerHTML = message.toString();
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
				style.width = 300;
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
Logger = Proto.clone().setType("Logger")
.setSlots(
{
	log: function()
	{
		console.log.apply(console, arguments);
	},
	
	warn: function()
	{
		console.warn.apply(console, arguments);
	},
	
	error: function()
	{
		console.error.apply(console, arguments);
	},
	
	disable: function()
	{
		this.log = function(){}
		this.warn = function(){}
		this.error = function(){}
		
		//if(Browser.isGecko() && window.console) return;
		
		if(!window.console)
		{
			window.console = {};
		}
		
		window.console.log = function(){};
		window.console.warn = function(){};
		window.console.error = function(){};
	}
});

if(window.ENVIRONMENT == "production") Logger.disable();
Array.prototype.setSlotsIfAbsent(
{
	init: function()
	{
		var args = [0, this.length];
		args.concatInPlace(this.slice());
		this.splice.apply(this, args);
	},

	empty: function()
	{
		this.splice(0, this.length);
		return this;
	},

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
		if(i > -1)
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

	pushIfAbsent: function()
	{
		console.log("pushIfAbsent is deprecated.  Use appendIfAbsent instead.");
		return this.appendIfAbsent.apply(this, arguments);
	},
	
	appendIfAbsent: function()
	{
		var self = this;
		this.argsAsArray(arguments).forEach(function(value)
		{
			if(self.indexOf(value) == -1)
			{
				self.push(value);
			}
		})
		
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

	forEachPerform: function()
	{
		return this.forEachCall.apply(this, arguments);
	},

	sortByCalling: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		return this.sort(function(x, y)
		{
			var xRes = x[functionName].apply(x, args);
			var yRes = y[functionName].apply(y, args);
			if(xRes < yRes)
			{
				return -1;
			}
			else if(yRes < xRes)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		});
	},

	mapByCalling: function()
	{
		console.log("mapByCalling is deprecated.  Use mapByPerforming instead.");
		return this.mapByPerforming.apply(this, arguments);
	},

	mapByPerforming: function(messageName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		return this.map(function(e, i)
		{
			args[args.length - 1] = i;
			return e[messageName].apply(e, args);
		});
	},

	detectByCalling: function()
	{
		console.log("detectByCalling is deprecated.  Use detectByPerforming instead.");
		return this.detectByPerforming.apply(this, arguments);
	},

	detectByPerforming: function(functionName)
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

	filterByPerforming: function(messageName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		return this.filter(function(e, i)
		{
			args[args.length - 1] = i;
			return e[messageName].apply(e, args);
		});
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

	max: function(callback)
	{
		var m = undefined;
		var mObject = undefined;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v > m)
			{
				m = v;
				mObject = this[i];
			}
		}

		return mObject;
	},

	maxIndex: function(callback)
	{
		var m = undefined;
		var index = 0;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v > m)
			{
				m = v;
				index = i;
			}
		}

		return index;
	},

	min: function(callback)
	{
		var m = undefined;
		var mObject = undefined;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v < m)
			{
				m = v;
				mObject = this[i];
			}
		}

		return mObject;
	},

	minIndex: function(callback)
	{
		var m = undefined;
		var index = 0;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v < m)
			{
				m = v;
				index = i;
			}
		}

		return index;
	},

	sum: function(callback)
	{
		var m = undefined;
		var sum = 0;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			sum = sum + v;
		}

		return sum;
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
	
	allRespondTrue: function(message)
	{
		return this.every(function(e){ return e.perform(message) });
	},
	
	firstRespondingTrue: function(message)
	{
		return this.detect(function(e){ return e.perform(message) });
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
	},

	removeFirst: function ()
	{
		return this.shift();
	},

	hasPrefix: function(otherArray)
	{
		if(this.length < otherArray.length) { return false; }

		for(var i = 0; i < this.length; i ++)
		{
			if(this[i] != otherArray[i]) return false;
		}

		return true;
	},

	toString: function()
	{
		var s = "[";

		for(var i = 0; i < this.length; i ++)
		{
			var value = this[i];

			if (i != 0) s = s + ","

			if(typeof(value) == "string")
			{
				s = s + "\"" + value + "\"";
			}
			else
			{
				s = s + value;
			}
		}

		return s + "]";
	},

	isEqual: function(otherArray)
	{
		if(this.length != otherArray.length) { return false; }

		for(var i = 0; i < this.length; i ++)
		{
			if(this[i] != otherArray[i]) return false;
		}

		return true;
	},

	elementWith: function(accessorFunctionName, value)
	{
		var e = this[this.mapByPerforming(accessorFunctionName).indexOf(value)];
		return e === undefined ? null : e;
	},

	atInsert: function(i, e)
	{
		this.splice(i, 0, e);
	},
	
	size: function()
	{
		return this.length;
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
	
	difference: function()
	{
		return this.upperBound() - this.lowerBound();
	},

	toString: function()
	{
		return (this.excludesLowerBound ? "(" : "[") + this._lowerBound + "," + this._upperBound + (this.excludesUpperBound ? ")" : "]");
	}
});
Number.prototype.setSlots(
{
	cssString: function() 
	{
		return this.toString();
	},
	
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
	
	map: function()
	{
		var a = [];
		for(var i = 0; i < this; i ++)
		{
			a.push(i);
		}
		return Array.prototype.map.apply(a, arguments);
	},

	isEven: function()
	{
		return this % 2 == 0;
	}
});
String.prototype.setSlotsIfAbsent(
{
	cssString: function() 
	{ 
		return this;
	},
	
	replaceSeq: function(a, b)
	{
		var s = this;
		var newString;
		
		if(b.contains(a)) throw "substring contains replace string";
		
		while(true)
		{
			var newString = s.replace(a, b)
			if(newString == s) return newString;;
			s = newString;
		}
		
		return this;
	},
	
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
		if(!prefix) return false;
		return this.indexOf(prefix) == 0;
	},

	removePrefix: function(prefix)
	{
		return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
	},

	endsWith: function(suffix)
	{
		var index = this.lastIndexOf(suffix);
		return (index > -1) && (this.lastIndexOf(suffix) == this.length - suffix.length);
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
	
	before: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1) return this;
		return this.slice(0, index); 
	},
	
	after: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1) return this;
		return this.slice(index);
	},
	
	asUncapitalized: function()
	{
		return this.replace(/\b[A-Z]/g, function(match) {
			return match.toLowerCase();
		});
	},
	
	asCapitalized: function()
	{
		return this.replace(/\b[A-Z]/g, function(match) {
			return match.toUpperCase();
		});
	},
	
	containsCapitals: function()
	{
		return this.search(/[A-Z]/g) > -1;
	},
	
	charAt: function(i)
	{
		return this.slice(i, i + 1);
	},
	
	first: function()
	{
		return this.slice(0, 1);
	},
	
	asNumber: function()
	{
		return Number(this);
	},
	
	stringCount: function(str)
	{
		return this.split(str).length - 1;
	},
	
	pathComponents: function()
	{
		return this.split("/");
	},
	
	lastPathComponent: function()
	{
		return this.pathComponents().last();
	},
	
	strip: function() {
    	return this.replace(/^\s+/, '').replace(/\s+$/, '');
  	}
});
Date.millisPerHour = function(){ return 3600 * 1000 };
Date.millisPerDay = function(){ return 24 * Date.millisPerHour() };
Date.millisPerYear = function(){ return Date.millisPerDay() * 365 };
Date.yearsFromNow = function(years){ return Date.fromMillis(Date.clone().getTime() + Date.millisPerYear() * years) };
Date.hoursAgo = function(hours){ return Date.fromMillis(Date.clone().getTime() - Date.millisPerHour() * hours) };
Date.daysAgo = function(days){ return Date.fromMillis(Date.clone().getTime() - Date.millisPerDay() * days) };
Date.fromMillis = function(millis)
{
	return new Date(millis);
}

Date.prototype.setSlots({
	startOfUTCDay: function()
	{
		return new Date(Math.floor(this.getTime() / Date.millisPerDay()) * Date.millisPerDay());
	}
})
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
function PropertyList_isEmpty(propertyList)
{
	for(var name in propertyList)
	{
		return false;
	}
	return true;
}

function PropertyList_values(propertyList)
{
	var a = [];
	for(var name in propertyList)
	{
		a.push(propertyList[name]);
	}
	return a;
}

function PropertyList_asArray(propertyList)
{
	return PropertyList_values(propertyList);
}

function PropertyList_pairs(propertyList)
{
	var a = [];
	for(var name in propertyList)
	{
		a.push([name, propertyList[name]]);
	}
	return a;
}

function PropertyList_keys(propertyList)
{
	var a = [];
	for(var name in propertyList)
	{
		a.push(name);
	}
	return a;
}

function PropertyList_values(propertyList)
{
	var a = [];
	for(var name in propertyList)
	{
		a.push(propertyList[name]);
	}
	return a;
}

function PropertyList_size(propertyList)
{
	var size = 0;
	for(var name in propertyList)
	{
		size ++;
	}
	return size;
}

function PropertyList_pairsSortedByValue(propertyList)
{
	return PropertyList_pairs(propertyList).sort(function(p0, p1){ return p0[1] - p1[1] });
}

function PropertyList_join(propertyList, kvSeparator, pairSeparator)
{
	return PropertyList_asArray(propertyList).mapByPerforming("join", kvSeparator).join(pairSeparator);
}

function PropertyList_shallowCopy(propertyList)
{
	var copy = {};
	for(var name in propertyList)
	{
		copy[name] = propertyList[name]
	}
	return copy;
}
