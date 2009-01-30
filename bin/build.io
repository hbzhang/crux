first := true

"Proto Importer Array Browser String Number Interval Uri" split foreach(protoName,
	if(first,
		first = false
	,
		writeln
	)
	writeln("\n/***************************** " .. protoName .. " *****************************/\n\n")
	writeln(File with("Protos/" .. protoName .. ".js") contents)
)