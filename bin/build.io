first := true

"Proto Importer Array String Number Interval Uri" split foreach(protoName,
	if(first,
		first = false
	,
		writeln
	)
	writeln("\n/***************************** " .. protoName .. " *****************************/\n\n")
	writeln(File with("javascript/Crux/Protos/" .. protoName .. ".js") contents)
)