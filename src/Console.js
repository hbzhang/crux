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
				this.appendMessageElement(message);
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