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