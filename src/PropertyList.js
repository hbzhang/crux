function PropertyList_isEmpty(propertyList)
{
	for(var name in propertyList)
	{
		return false;
	}
	return true;
}