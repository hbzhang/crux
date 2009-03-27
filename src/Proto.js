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

RUN_TEST = function()
{
	var start = new Date;
	for(var i = 0; i < 10000; i ++)
	{
		Proto.clone();
	}
	var clone = (new Date) - start;
	
	var start = new Date;
	for(var i = 0; i < 10000; i ++)
	{
		Proto.clone2();
	}
	var clone2 = (new Date) - start;
	alert(clone2 / clone);
}

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
	
	setterName: function(slotName)
	{
		return "set" + (slotName.indexOf("is") == 0 ? slotName.slice(2) : slotName).asCapitalized();
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
		  console.log(calls[i].name + ":" + calls[i].count);
		}
	},
	
	newSlot: function(name, initialValue)
	{
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
		this[this.setterName(name)] = function(newValue)
		{
			this["_" + name] = newValue;
			return this;
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
		this[this.setterName(aliasName)] = this[this.setterName(slotName)];
		this[this.setterName("set" + aliasName.asCapitalized())] = this["set" + slotName.asCapitalized()];
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

