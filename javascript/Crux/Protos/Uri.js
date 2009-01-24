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