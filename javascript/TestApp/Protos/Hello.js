Hello = Proto.clone().newSlot("times", 5).newSlots("firstName", "lastName").setSlots(
{
    sayHello: function()
    {
		var self = this;
        this._times.repeat(function()
        {
			document.body.innerHTML += "<p>Hello " + self._firstName + " " + self._lastName + "!</p>";
			/*
			var body = document.getElementsByTagName("body")[0];
			var hello = document.createElement("div");
			hello.innerHTML = "Hello " + this._firstName + " " + this._lastName + "!";
            body.appendChild(hello);
			*/
        });
    }
});