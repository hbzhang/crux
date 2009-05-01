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
	}
});