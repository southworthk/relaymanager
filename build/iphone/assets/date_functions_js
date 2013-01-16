function getRaceDisplayDate(dateStr_dd){
	var raceDate_dd = convertStrToDate(dateStr_dd);
	var year_dd = raceDate_dd.getFullYear();
	var month_dd = getLongMonthStr(raceDate_dd.getMonth());
	var day_dd = raceDate_dd.getDate();
	return month_dd + " " + day_dd + ", " + year_dd;
}

/*
 *  This function converts date strings in the format yyyy-mm-dd
 */

function convertStrToDate(dateStr_cs){
	if((dateStr_cs != null) && (dateStr_cs.length > 4)){
		var year_cs = parseInt(dateStr_cs.substr(0,4));
		var mm = dateStr_cs.substr(5,2);
		mm = (mm.substr(0,1) == '0') ? mm.substr(1) : mm;
		var month_cs = parseInt(mm)-1;
		var dd = dateStr_cs.substr(8);
		dd = (dd.substr(0,1) == '0') ? dd.substr(1) : dd;
		var day_cs = parseInt(dd);
		return new Date(year_cs,month_cs,day_cs)	
	} else {
		return null;
	}
}

/*
 * return full month string
 */
function getLongMonthStr(index){
	var monthStr;
	switch(index){
		case 0:
			monthStr = "January";
			break;
		case 1:
			monthStr = "February";
			break;
		case 2:
			monthStr = "March";
			break;
		case 3:
			monthStr = "April";
			break;
		case 4:
			monthStr = "May";
			break;
		case 5:
			monthStr = "June";
			break;
		case 6:
			monthStr = "July";
			break;
		case 7:
			monthStr = "August";
			break;
		case 8:
			monthStr = "September";
			break;
		case 9:
			monthStr = "October";
			break;
		case 10:
			monthStr = "November";
			break;
		case 11:
			monthStr = "December";
			break;
	}
	return monthStr;	
}

/*
 * return abbreviated month string
 */
function getAbbrMonthStr(index){
	var monthStr;
	switch(index){
		case 0:
			monthStr = "Jan";
			break;
		case 1:
			monthStr = "Feb";
			break;
		case 2:
			monthStr = "Mar";
			break;
		case 3:
			monthStr = "Apr";
			break;
		case 4:
			monthStr = "May";
			break;
		case 5:
			monthStr = "Jun";
			break;
		case 6:
			monthStr = "Jul";
			break;
		case 7:
			monthStr = "Aug";
			break;
		case 8:
			monthStr = "Sep";
			break;
		case 9:
			monthStr = "Oct";
			break;
		case 10:
			monthStr = "Nov";
			break;
		case 11:
			monthStr = "Dec";
			break;
	}
	return monthStr;	
}

