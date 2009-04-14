function PropertyList_isEmpty(propertyList)
{
	for(var name in propertyList)
	{
		return false;
	}
	return true;
}

function PropertyList_asArray(propertyList)
{
	var a = [];
	for(var name in propertyList)
	{
		a.push(propertyList[name]);
	}
	return a;
}

function PropertyList_join(propertyList, separator)
{
	return PropertyList_asArray(propertyList).join(separator);
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