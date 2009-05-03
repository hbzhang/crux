Date.millisPerHour = function(){ return 3600 * 1000 };
Date.millisPerDay = function(){ return 24 * Date.millisPerHour() };
Date.millisPerYear = function(){ return Date.millisPerDay() * 365 };
Date.yearsFromNow = function(years){ return Date.fromMillis(Date.clone().getTime() + Date.millisPerYear() * years) };
Date.hoursAgo = function(hours){ return Date.fromMillis(Date.clone().getTime() - Date.millisPerHour() * hours) };
Date.daysAgo = function(days){ return Date.fromMillis(Date.clone().getTime() - Date.millisPerDay() * days) };
Date.fromMillis = function(millis)
{
	return new Date(millis);
}