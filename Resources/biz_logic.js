Ti.include('get_displaytime.js');

var SHARED_SECRET_VALUE = '4dd912e8c4d73f1a5c7969685ec23038'; // shared secret
var MILLISECONDS_PER_YEAR = 31556736000;
var MILLISECONDS_PER_DAY = 86400000;
var MILLISECONDS_PER_HOUR = 3600000;
var MILLISECONDS_PER_MINUTE = 60000;

function getSharedSecret(){
	return SHARED_SECRET_VALUE;
}

var noNetworkAlert = Titanium.UI.createAlertDialog({
	title:'Error',
	message:'You do not currently have a network connection. Please try again later.'
});

/*
 *  This function retrieves the actual start time from the server
 */

function getActualStartTimeFromServer(){
	var xhrUpdate = Titanium.Network.createHTTPClient();
	xhrUpdate.onload = function(){
		try{
			var rid = getRaceId();
			var dbGASTFS = Titanium.Database.open('main');
			var doc = this.responseXML.documentElement;
			var elements = doc.getElementsByTagName("leg");
			var ln = elements.item(0).getAttribute("number");  // get the leg number
			var legNumber = parseInt(ln);
			var legStart = elements.item(0).text;
			if((legNumber == 0) && (legStart > 100000)){
				// check to see if it agrees with the currently record start time
				if(getActualStartOfRelay() !== legStart){
					// update settings table
					dbGASTFS.execute("UPDATE settings SET start_of_relay = ? WHERE setting_id = 1",legStart); 
					var rowGASTFS = dbGASTFS.execute("SELECT leg_start FROM relay_results WHERE race_id = ? AND leg_id = 1",rid);
					if(rowGASTFS.isValidRow()){
						var ls = rowGASTFS.field(0);
						if(ls !== legStart){ // legStart comes from the server, that's the official start
							dbGASTFS.execute("UPDATE relay_results SET leg_start = ? WHERE race_id = ? AND leg_id = 1",legStart,rid);
						}
					}
					rowGASTFS.close();
				}
			}
			
		}catch(ex){
			Ti.API.info('getActualStartTimeFromServer() Error: '+ex);
		}

	}
	xhrUpdate.open('POST','http://sinequanonsolutions.appspot.com/teamsync');

	var data = {};
	data.procId = "9";
	data.ss = SHARED_SECRET_VALUE;
	data.prediction_key = teamPredictionKey;
	data.handoff_key = handoffKey;
	if(Titanium.Network.online == 1){
		xhrUpdate.send(data);
	}
}

/*
 *  This function updates the server with the actual start time
 */
function setActualStartTimeOnServer(stime){
	var xhrUpdate = Titanium.Network.createHTTPClient();
	xhrUpdate.onload = function(){
		try{
			var dbSASTOS = Titanium.Database.open('main');
			var doc = this.responseXML.documentElement;
			var elements = doc.getElementsByTagName("leg");
			var ln = elements.item(0).getAttribute("number");  // get the leg number
			var legNumber = parseInt(ln);
			var legStart = elements.item(0).text;
			if((legNumber == 0) && (legStart > 100000)){
				// check to see if it agrees with the currently record start time
				if(getActualStartOfRelay() !== legStart){
					// update settings table
					dbSASTOS.execute("UPDATE settings SET start_of_relay = ? WHERE setting_id = 1",legStart); 
					// update relay results table if row exists
					//dbSASTOS.execute('UPDATE relay_results SET leg_start = ? WHERE race_id = ? AND leg_id = 1',legStart,getRaceId());
				}
			}
			
		}catch(ex){
			Ti.API.info('setActualStartTimeOnServer Error: '+ex);
		}

	}
	xhrUpdate.open('POST','http://sinequanonsolutions.appspot.com/teamsync');

	var data = {};
	data.procId = "8";
	data.ss = SHARED_SECRET_VALUE;
	data.prediction_key = teamPredictionKey;
	data.handoff_key = handoffKey;
	data.starttime = stime;
	if(Titanium.Network.online == 1){
		xhrUpdate.send(data);
	}
}




function relayResultExists(legNum){
	var crid = getRaceId();
	var legCount = 0;
	var dbMainRRE = Titanium.Database.open('main');
	var rowRRE = dbMain.execute('SELECT COUNT(leg_id) FROM race_leg WHERE race_id = ? AND leg_id = ?',crid,legNum);
	if (rowRRE.isValidRow()){
		legCount = rowRRE.field(0);
	}
	rowRRE.close();
	if(legCount == 0){
		return false;
	}else{
		return true;
	}
}

function haveLegsBeenUpdated(){
	var crid = getRaceId();
	var legCount = 0;
	var dbMainHLBU = Titanium.Database.open('main');
	var rowHLBU = dbMain.execute('SELECT COUNT(leg_id) FROM race_leg WHERE race_id = ?',crid);
	if (rowHLBU.isValidRow()){
		legCount = rowHLBU.field(0);
	}
	rowHLBU.close();
	if (legCount == 36){
		return true;
	} else {
		return false;
	}
};


function updateRaceDistances(){
	var crid = getRaceId();
	if(Titanium.Network.online == 1){
		rowCount = 0;
		rCount = dbMain.execute('SELECT COUNT(*) FROM race_leg WHERE race_id = ?',crid);
		if(rCount.isValidRow()){
			rowCount = rCount.field(0);	
		}
		rCount.close();
		
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function(){
			try{
				var doc = this.responseXML.documentElement;
				var elements = doc.getElementsByTagName("sql");
				var nrid = getRaceId();
				if(nrid == crid){
					dbMain.execute('DELETE FROM race_leg WHERE race_id = ?',nrid);
				}
				for(var i=0; i<elements.length; i++){
					var sql = elements.item(i).text;
					dbMain.execute(sql);
				}
			}catch(e){
				Ti.API.info('updateRaceDistances Error: '+e.error);
			}
		};

		xhr.open('POST','http://sinequanonsolutions.appspot.com/distance');
		var data = {};
		data.procid = "0";
		data.raceId = crid;
		data.rowCount = rowCount;
		data.sharedsecret = getSharedSecret();
		if(Titanium.Network.online == 1){
			xhr.send(data);
		}
	}

};

function getLegResult(raceId,legNum,prevLegStart){
	dbMainLR = Titanium.Database.open('main');
	var legObj = new Object();
	legObj.legNum = legNum;
	
	var rowLR = dbMainLR.execute('SELECT leg_start,leg_end FROM relay_results WHERE race_id = ? AND leg_id = ?',raceId,legNum);
	if(rowLR.isValidRow()){
		var ls = rowLR.field(0);
		if(ls !== null){
			legObj.legStart = ls;
		}else{
			legObj.legStart = 0;
		}
		var le = rowLR.field(1);
		if ((le !== null) && (le > 0)){
			legObj.state = "A"; // P stands for Projected, A stands for Actual
			legObj.legEnd = le;
		} else {
			legObj.state = "P";
			legObj.legEnd = ls + getProjectedRunnerTime(legNum,raceId);
		}	
	} else {
		legObj.state = "P";
		legObj.legStart = prevLegStart;
		legObj.legEnd = prevLegStart + getProjectedRunnerTime(legNum,raceId);
	}
	rowLR.close();
	return legObj;
};

function validateEmailAddress(emailAddress){
	var x = emailAddress;
	var atpos=x.indexOf("@");
	var dotpos=x.lastIndexOf(".");
	if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length)
  	{
  		return false;
  	} else {
  		return true;
  	}	
};

/*
 *  updates leg information for the selected race
 */

function updateRaceDistance(){
	var rid = getRaceId(); // race id
	var dbMainRD = Titanium.Database.open('main');
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function(){
		Ti.API.info('update distance onload function called');
		//Ti.API.info('xml: ' + this.responseXML + ' text ' + this.responseText);
		try{
			var doc = this.responseXML.documentElement;
			var elements = doc.getElementsByTagName("sql");
			for(var i=0; i<elements.length; i++){
				var sql = elements.item(i).text;
				Ti.API.info("biz_logic - sql: "+sql);
				dbMainRD.execute(sql);
			}
		}catch(e){
			Ti.API.info('updateRaceDistance Error: '+e.error);
		}
		//dbMainRD.close();
	};

	xhr.open('POST','http://sinequanonsolutions.appspot.com/distance');
	var data = {};
	data.procid = "0";
	data.raceId = rid;
	data.sharedsecret = getSharedSecret();
	if((rid !== -1) && (Titanium.Network.online == 1)){
		xhr.send(data);
	}
};

/*
 *  updates the set assignments for each of the runners
 */
function updateSetAssignments(){
   var raceId = getRaceId(); // race id
   var dbMainSA = Titanium.Database.open('main');
   
   dbMainSA.execute('DELETE FROM set_assignment');
   var rowsSA = dbMainSA.execute('SELECT runner_id,set_id FROM runner ORDER BY set_id');
   while (rowsSA.isValidRow()){
	   var rid = rowsSA.field(0);
	   var sid = rowsSA.field(1);
	   dbMainSA.execute('INSERT INTO set_assignment(race_id, runner_id, set_id) VALUES (?,?,?)',raceId,rid,sid);
	   rowsSA.next();
   }
   rowsSA.close();
   
   dbMainSA.execute('UPDATE settings SET ready_to_start = 1,race_id = ? WHERE setting_id = 1',raceId);
   //dbMainSA.close();
	
};

/*
 *  returns the number of rows for a particular table
 */
function tableRowCount(tableName){
	var count = 0;
	var sqlStatement = 'SELECT COUNT(*) FROM '+tableName;
	//Ti.API.info(sqlStatement);
	var dbMainRC = Titanium.Database.open('main');
	var rowRC = dbMainRC.execute(sqlStatement);
	if(rowRC.isValidRow()){
		count = rowRC.field(0);
	}
	rowRC.close();
	//dbMainRC.close();
	return count;
};


/*
 * returns the current race id
 */
function getRaceId(){
	var dbMainRID = Ti.Database.open('main');
	var rowRID = dbMainRID.execute("SELECT race_id FROM settings WHERE setting_id = 1");
	var raceId = -1;
	if(rowRID.isValidRow()){
		raceId = rowRID.field(0);	
	}
	rowRID.close();
	//dbMainRID.close();
	Titanium.App.Properties.setInt('RaceId',raceId);
	return raceId;
}


/*
 * returns the listening status
 */
function isListeningOn(){
	var dbMainLO = Ti.Database.open('main');
	var rowLO = dbMainLO.execute("SELECT listen FROM handoff_status WHERE handoff_id = 1");
	var listenStatus = 0;
	if(rowLO.isValidRow()){
		listenStatus = rowLO.field(0);	
	}
	rowLO.close();
	//dbMainLO.close();
	Titanium.App.Properties.setInt('ListenStatus',listenStatus);
	return listenStatus;
}


/*
 * returns the sharing status
 */
function isSharingOn(){
	var dbMainSO = Ti.Database.open('main');
	var rowSO = dbMainSO.execute("SELECT active FROM handoff_status WHERE handoff_id = 1");
	var sharingStatus = 0;
	if(rowSO.isValidRow()){
		sharingStatus = rowSO.field(0);	
	}
	rowSO.close();
	//dbMainSO.close();
	Titanium.App.Properties.setInt('SharingStatus',sharingStatus);
	return sharingStatus;
}

/*
 * returns the current leg
 */
function getCurrentLeg(){
	var dbMainCL = Ti.Database.open('main');
	var rowCL = dbMainCL.execute("SELECT current_leg,start_of_relay,end_of_relay FROM settings WHERE setting_id = 1");
	var currentLeg = 0;
	var sor = 0;
	var eor = 0;
	if(rowCL.isValidRow()){
		currentLeg = rowCL.field(0);
		sor = rowCL.field(1);
		eor = rowCL.field(2);	
	}
	rowCL.close();
	if((sor > 0) && (eor > 0)){ // the race is over
		currentLeg = 37;
		dbMainCL.execute('UPDATE settings SET current_leg = 37 WHERE setting_id = 1');	
	}
	
	//dbMainCL.close();
	Titanium.App.Properties.setInt('CurrentLeg',currentLeg);
	return currentLeg;	
};

/*
 *  returns the current leg number along with the runner
 */
function getCurrentRunner(){
	var currLeg = getCurrentLeg();
	var setNum = getSetNumberForLegNum(currLeg);
	return getRunner(setNum)
};

function getTime() {
	var timeStr = "";
	try{
		var suffix = " a.m.";
		var currentTime = new Date();
		var hours = currentTime.getHours();
		if(hours > 12){
			suffix = " p.m.";
			hours = hours - 12;
		}
		var minutes = currentTime.getMinutes();
		var seconds = currentTime.getSeconds();
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		var hrStr = (hours < 10) ? "0"+hours : ""+hours;
		var minStr = (minutes < 10) ? "0"+minutes : ""+minutes;
		var secStr = (seconds < 10) ? "0"+seconds : ""+seconds;
		timeStr = "at "+hrStr+":"+minStr+":"+secStr+suffix;
	}catch(ex){
			Ti.API.info('getTime error: '+ex);
	}

	return timeStr;
 
}

/*
 *  Returns the actual start of the race
 */

function getActualStartOfRelay(){
	var sor = 0;
	var dbASoR = Ti.Database.open('main');
	var rowASoR = dbASoR.execute('SELECT start_of_relay FROM settings WHERE setting_id = 1');
	if(rowASoR.isValidRow()){
		sor = rowASoR.field(0);
	}
	Ti.API.info('start of relay from settings table: '+sor);
	if(sor == 0){
		rowASoR = dbASoR.execute('SELECT COUNT(*) FROM relay_results WHERE leg_id = 1 AND race_id = ?',getRaceId());
		var count = 0;
		if(rowASoR.isValidRow()){
			count = rowASoR.field(0);
		}
		if(count > 0){
			rowASoR = dbASoR.execute('SELECT leg_start FROM relay_results WHERE leg_id = 1 AND race_id = ?',getRaceId());
			if(rowASoR.isValidRow()){
				sor = rowASoR.field(0);
			}
			Ti.API.info('start of relay from relay_results table: '+sor);
			if(sor > 100000){
				dbASoR.execute('UPDATE settings SET start_of_relay = ? WHERE setting_id = 1',sor);
			}
		}
	}
	rowASoR.close();
	if((sor !== null) && (sor > 0)){
		return sor;
	}else{
		Ti.API.info('Error (call to getRaceStartTime): it should not return this if the race is going on!');
		return getRaceStartTime();
	}
};

/*
 * returns the scheduled start of the selected race in milliseconds
 */

function getRaceStartTime(){
	var dbMainRS = Ti.Database.open('main');
	var rowRS = dbMainRS.execute("SELECT race_id,start_of_relay,assigned_team_start FROM settings WHERE setting_id = 1");
	var raceId = -1;
	var assignedTeamStart = -1;
	var actualStartTime = -1;
	var rDateMS = -1;
	if(rowRS.isValidRow()){
		raceId = rowRS.field(0);	
		actualStartTime = rowRS.field(1);
		assignedTeamStart = rowRS.field(2);
	}
	rowRS.close();
	if(actualStartTime > 100000){
		assignedTeamStart = actualStartTime;
	}
	
	var startHour = 12;
	var startMin = 0;
	
	if(raceId > 0){
		if ((assignedTeamStart !== null) && (assignedTeamStart.length > 2)){
			var colonPS = assignedTeamStart.indexOf(":");
			startHour = assignedTeamStart.substring(0,colonPS);
			startMin = assignedTeamStart.substring(colonPS+1);
		}
		
		var raceDate = "-1";
		var rowTS = dbMainRS.execute("SELECT race_date FROM race WHERE race_id = ?",raceId);
		if(rowTS.isValidRow()){
			raceDate = rowTS.field(0);
		}
		rowTS.close();
		if((raceDate !== -1) && (raceDate.length > 4)){
			var rDate = convertStrToDate(raceDate);
			var rDateMS = rDate.getTime() + (startHour*MILLISECONDS_PER_HOUR) + (startMin*MILLISECONDS_PER_MINUTE);
	/*		var now = new Date();
			var nowTime = now.getTime();
			var ms = rDateMS - nowTime;
			var days = Math.floor(ms / MILLISECONDS_PER_DAY);
			var x = 1;
	*/
		}
		//dbMainCL.close();
		Titanium.App.Properties.setInt('AssignedStart',assignedTeamStart);
	}
	return rDateMS;		
}

function convertStrToDate(dateStr_cs){
	if((dateStr_cs != null) && (dateStr_cs.length > 4)){
		var year_cs = parseInt(dateStr_cs.substr(0,4));
		var mm = dateStr_cs.substr(5,2);
		var month_cs = 0;
		
		// the replace function is buggy so we need to do this the hard way
		switch(mm){
			case "01":
				month_cs = 0;
				break;
			case "02":
				month_cs = 1;
				break;
			case "03":
				month_cs = 2;
				break;
			case "04":
				month_cs = 3;
				break;
			case "05":
				month_cs = 4;
				break;
			case "06":
				month_cs = 5;
				break;
			case "07":
				month_cs = 6;
				break;
			case "08":
				month_cs = 7;
				break;
			case "09":
				month_cs = 8;
				break;
			case "10":
				month_cs = 9;
				break;
			case "11":
				month_cs = 10;
				break;
			case "12":
				month_cs = 11;
				break;
		}
		
		var dd = dateStr_cs.substr(8);
		var day_cs = 0;
		switch(dd){
			case "01":
				day_cs = 1;
				break;
			case "02":
				day_cs = 2;
				break;
			case "03":
				day_cs = 3;
				break;
			case "04":
				day_cs = 4;
				break;
			case "05":
				day_cs = 5;
				break;
			case "06":
				day_cs = 6;
				break;
			case "07":
				day_cs = 7;
				break;
			case "08":
				day_cs = 8;
				break;
			case "09":
				day_cs = 9;
				break;
			case "10":
				day_cs = 10;
				break;
			case "11":
				day_cs = 11;
				break;
			case "12":
				day_cs = 12;
				break;
			case "13":
				day_cs = 13;
				break;
			case "14":
				day_cs = 14;
				break;
			case "15":
				day_cs = 15;
				break;
			case "16":
				day_cs = 16;
				break;
			case "17":
				day_cs = 17;
				break;
			case "18":
				day_cs = 18;
				break;
			case "19":
				day_cs = 19;
				break;
			case "20":
				day_cs = 20;
				break;
			case "21":
				day_cs = 21;
				break;
			case "22":
				day_cs = 22;
				break;
			case "23":
				day_cs = 23;
				break;
			case "24":
				day_cs = 24;
				break;
			case "25":
				day_cs = 25;
				break;
			case "26":
				day_cs = 26;
				break;
			case "27":
				day_cs = 27;
				break;
			case "28":
				day_cs = 28;
				break;
			case "29":
				day_cs = 29;
				break;
			case "30":
				day_cs = 30;
				break;
			case "31":
				day_cs = 31;
				break;

		}

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

function getRaceDisplayDate(dateStr_dd){
	var raceDate_dd = convertStrToDate(dateStr_dd);
	var year_dd = raceDate_dd.getFullYear();
	var month_dd = getLongMonthStr(raceDate_dd.getMonth());
	var day_dd = raceDate_dd.getDate();
	return month_dd + " " + day_dd + ", " + year_dd;
}

function getRaceDate(){
	var dbMainRDt = Titanium.Database.open('main');
	var raceDate = '2010-01-01';
	
	try{
		var row = dbMainRDt.execute('SELECT team_name,race_id FROM settings WHERE setting_id = 1');
		if(row.isValidRow()){
			var tn = row.field(0);
			var ri = row.field(1);
			if (ri != '-1'){
				var qRow = dbMainRDt.execute('SELECT race_name,race_date FROM race WHERE race_id = ?',ri);
				if (qRow.isValidRow()){
					raceName = qRow.field(0);
					raceDate = qRow.field(1);
					Titanium.App.Properties.setString('RaceName',raceName);
					Titanium.App.Properties.setInt('RaceId',ri);
				}
				qRow.close();
			}
		}
		row.close();
	}catch(ex){
		Ti.API.info('getRaceDate exception: '+ex);
	}
	return raceDate;	
}

function getRaceName(){

	var dbMainRN = Titanium.Database.open('main');
	var raceName = 'Unknown';
	
	try{
		var row = dbMainRN.execute('SELECT team_name,race_id FROM settings WHERE setting_id = 1');
		if(row.isValidRow()){
			var tn = row.field(0);
			var ri = row.field(1);
			if (ri != '-1'){
				var qRow = dbMainRN.execute('SELECT race_name,race_date FROM race WHERE race_id = ?',ri);
				if (qRow.isValidRow()){
					raceName = qRow.field(0);
					raceDate = qRow.field(1);
					//Ti.API.info('getRaceName, raceName: '+raceName);
					//Ti.API.info('getRaceName, raceDate: '+raceDate);
					Titanium.App.Properties.setString('RaceName',raceName);
					Titanium.App.Properties.setInt('RaceId',ri);
				}
				qRow.close();
			}
		}
		row.close();
	}catch(ex){
		Ti.API.info('getRaceName exception: '+ex);
	}
	return raceName;	
}


function setNetworkStatusForLeg(legNum,status){  // status: 1 = recorded on this device, 2 = leg info sent to server, 3 = synched with server
	var sqlStatement = '';
	
	// Don't set status to synchronized if the leg is incomplete
	if((status == 3) && ((getStartTimeForLeg(legNum) < 100000) || (getFinishTimeForLeg(legNum) < 100000))){
		Ti.API.info('setNetworkStatusForLeg 01: '+legNum+', status: '+status);
		Ti.API.info('setNetworkStatusForLeg startTime'+getStartTimeForLeg(legNum));
		Ti.API.info('setNetworkStatusForLeg finishTime'+getFinishTimeForLeg(legNum));
		return;
	}else{
		Ti.API.info('setNetworkStatusForLeg 02: '+legNum+', status: '+status);
		Ti.API.info('setNetworkStatusForLeg startTime'+getStartTimeForLeg(legNum));
		Ti.API.info('setNetworkStatusForLeg finishTime'+getFinishTimeForLeg(legNum));

		switch(legNum){
			case 0:
				sqlStatement = 'UPDATE network_status SET s_s = '+status+' WHERE network_id = 1';
				break;
			case 1:
				sqlStatement = 'UPDATE network_status SET s_1 = '+status+' WHERE network_id = 1';
				break;
			case 2:
				sqlStatement = 'UPDATE network_status SET s_2 = '+status+' WHERE network_id = 1';
				break;
			case 3:
				sqlStatement = 'UPDATE network_status SET s_3 = '+status+' WHERE network_id = 1';
				break;
			case 4:
				sqlStatement = 'UPDATE network_status SET s_4 = '+status+' WHERE network_id = 1';
				break;
			case 5:
				sqlStatement = 'UPDATE network_status SET s_5 = '+status+' WHERE network_id = 1';
				break;
			case 6:
				sqlStatement = 'UPDATE network_status SET s_6 = '+status+' WHERE network_id = 1';
				break;
			case 7:
				sqlStatement = 'UPDATE network_status SET s_7 = '+status+' WHERE network_id = 1';
				break;
			case 8:
				sqlStatement = 'UPDATE network_status SET s_8 = '+status+' WHERE network_id = 1';
				break;
			case 9:
				sqlStatement = 'UPDATE network_status SET s_9 = '+status+' WHERE network_id = 1';
				break;
			case 10:
				sqlStatement = 'UPDATE network_status SET s_10 = '+status+' WHERE network_id = 1';
				break;
			case 11:
				sqlStatement = 'UPDATE network_status SET s_11 = '+status+' WHERE network_id = 1';
				break;
			case 12:
				sqlStatement = 'UPDATE network_status SET s_12 = '+status+' WHERE network_id = 1';
				break;
			case 13:
				sqlStatement = 'UPDATE network_status SET s_13 = '+status+' WHERE network_id = 1';
				break;
			case 14:
				sqlStatement = 'UPDATE network_status SET s_14 = '+status+' WHERE network_id = 1';
				break;
			case 15:
				sqlStatement = 'UPDATE network_status SET s_15 = '+status+' WHERE network_id = 1';
				break;
			case 16:
				sqlStatement = 'UPDATE network_status SET s_16 = '+status+' WHERE network_id = 1';
				break;
			case 17:
				sqlStatement = 'UPDATE network_status SET s_17 = '+status+' WHERE network_id = 1';
				break;
			case 18:
				sqlStatement = 'UPDATE network_status SET s_18 = '+status+' WHERE network_id = 1';
				break;
			case 19:
				sqlStatement = 'UPDATE network_status SET s_19 = '+status+' WHERE network_id = 1';
				break;
			case 20:
				sqlStatement = 'UPDATE network_status SET s_20 = '+status+' WHERE network_id = 1';
				break;
			case 21:
				sqlStatement = 'UPDATE network_status SET s_21 = '+status+' WHERE network_id = 1';
				break;
			case 22:
				sqlStatement = 'UPDATE network_status SET s_22 = '+status+' WHERE network_id = 1';
				break;
			case 23:
				sqlStatement = 'UPDATE network_status SET s_23 = '+status+' WHERE network_id = 1';
				break;
			case 24:
				sqlStatement = 'UPDATE network_status SET s_24 = '+status+' WHERE network_id = 1';
				break;
			case 25:
				sqlStatement = 'UPDATE network_status SET s_25 = '+status+' WHERE network_id = 1';
				break;
			case 26:
				sqlStatement = 'UPDATE network_status SET s_26 = '+status+' WHERE network_id = 1';
				break;
			case 27:
				sqlStatement = 'UPDATE network_status SET s_27 = '+status+' WHERE network_id = 1';
				break;
			case 28:
				sqlStatement = 'UPDATE network_status SET s_28 = '+status+' WHERE network_id = 1';
				break;
			case 29:
				sqlStatement = 'UPDATE network_status SET s_29 = '+status+' WHERE network_id = 1';
				break;
			case 30:
				sqlStatement = 'UPDATE network_status SET s_30 = '+status+' WHERE network_id = 1';
				break;
			case 31:
				sqlStatement = 'UPDATE network_status SET s_31 = '+status+' WHERE network_id = 1';
				break;
			case 32:
				sqlStatement = 'UPDATE network_status SET s_32 = '+status+' WHERE network_id = 1';
				break;
			case 33:
				sqlStatement = 'UPDATE network_status SET s_33 = '+status+' WHERE network_id = 1';
				break;
			case 34:
				sqlStatement = 'UPDATE network_status SET s_34 = '+status+' WHERE network_id = 1';
				break;
			case 35:
				sqlStatement = 'UPDATE network_status SET s_35 = '+status+' WHERE network_id = 1';
				break;
			case 36:
				sqlStatement = 'UPDATE network_status SET s_36 = '+status+' WHERE network_id = 1';
				break;
		}
	}
	if (sqlStatement.length > 0){
		   var dbMainUNS = Titanium.Database.open('main');
		   Ti.API.log('setNetworkStatusForLeg sql: '+sqlStatement);
		   dbMainUNS.execute(sqlStatement);
	}
}

function getNetworkStatusForLeg(legNum){
	var sqlStatement = '';
	
	switch(legNum){
		case 0:
			sqlStatement = 'SELECT s_s FROM network_status WHERE network_id = 1';
			break;
		case 1:
			sqlStatement = 'SELECT s_1 FROM network_status WHERE network_id = 1';
			break;
		case 2:
			sqlStatement = 'SELECT s_2 FROM network_status WHERE network_id = 1';
			break;
		case 3:
			sqlStatement = 'SELECT s_3 FROM network_status WHERE network_id = 1';
			break;
		case 4:
			sqlStatement = 'SELECT s_4 FROM network_status WHERE network_id = 1';
			break;
		case 5:
			sqlStatement = 'SELECT s_5 FROM network_status WHERE network_id = 1';
			break;
		case 6:
			sqlStatement = 'SELECT s_6 FROM network_status WHERE network_id = 1';
			break;
		case 7:
			sqlStatement = 'SELECT s_7 FROM network_status WHERE network_id = 1';
			break;
		case 8:
			sqlStatement = 'SELECT s_8 FROM network_status WHERE network_id = 1';
			break;
		case 9:
			sqlStatement = 'SELECT s_9 FROM network_status WHERE network_id = 1';
			break;
		case 10:
			sqlStatement = 'SELECT s_10 FROM network_status WHERE network_id = 1';
			break;
		case 11:
			sqlStatement = 'SELECT s_11 FROM network_status WHERE network_id = 1';
			break;
		case 12:
			sqlStatement = 'SELECT s_12 FROM network_status WHERE network_id = 1';
			break;
		case 13:
			sqlStatement = 'SELECT s_13 FROM network_status WHERE network_id = 1';
			break;
		case 14:
			sqlStatement = 'SELECT s_14 FROM network_status WHERE network_id = 1';
			break;
		case 15:
			sqlStatement = 'SELECT s_15 FROM network_status WHERE network_id = 1';
			break;
		case 16:
			sqlStatement = 'SELECT s_16 FROM network_status WHERE network_id = 1';
			break;
		case 17:
			sqlStatement = 'SELECT s_17 FROM network_status WHERE network_id = 1';
			break;
		case 18:
			sqlStatement = 'SELECT s_18 FROM network_status WHERE network_id = 1';
			break;
		case 19:
			sqlStatement = 'SELECT s_19 FROM network_status WHERE network_id = 1';
			break;
		case 20:
			sqlStatement = 'SELECT s_20 FROM network_status WHERE network_id = 1';
			break;
		case 21:
			sqlStatement = 'SELECT s_21 FROM network_status WHERE network_id = 1';
			break;
		case 22:
			sqlStatement = 'SELECT s_22 FROM network_status WHERE network_id = 1';
			break;
		case 23:
			sqlStatement = 'SELECT s_23 FROM network_status WHERE network_id = 1';
			break;
		case 24:
			sqlStatement = 'SELECT s_24 FROM network_status WHERE network_id = 1';
			break;
		case 25:
			sqlStatement = 'SELECT s_25 FROM network_status WHERE network_id = 1';
			break;
		case 26:
			sqlStatement = 'SELECT s_26 FROM network_status WHERE network_id = 1';
			break;
		case 27:
			sqlStatement = 'SELECT s_27 FROM network_status WHERE network_id = 1';
			break;
		case 28:
			sqlStatement = 'SELECT s_28 FROM network_status WHERE network_id = 1';
			break;
		case 29:
			sqlStatement = 'SELECT s_29 FROM network_status WHERE network_id = 1';
			break;
		case 30:
			sqlStatement = 'SELECT s_30 FROM network_status WHERE network_id = 1';
			break;
		case 31:
			sqlStatement = 'SELECT s_31 FROM network_status WHERE network_id = 1';
			break;
		case 32:
			sqlStatement = 'SELECT s_32 FROM network_status WHERE network_id = 1';
			break;
		case 33:
			sqlStatement = 'SELECT s_33 FROM network_status WHERE network_id = 1';
			break;
		case 34:
			sqlStatement = 'SELECT s_34 FROM network_status WHERE network_id = 1';
			break;
		case 35:
			sqlStatement = 'SELECT s_35 FROM network_status WHERE network_id = 1';
			break;
		case 36:
			sqlStatement = 'SELECT s_36 FROM network_status WHERE network_id = 1';
			break;
	}
	if (sqlStatement.length > 0){
		   var dbMainGNS = Titanium.Database.open('main');
		   var rowGNS = dbMainGNS.execute(sqlStatement);
		   var legValue = -1; 
		   
		   if(rowGNS.isValidRow()){
		   		legValue = rowGNS.field(0);	
		   }
		   rowGNS.close();
		   return legValue;
	}
}

function relayResultExists(raceId,legNum){
	var rrCount = 0;
	var dbMainRRE = Ti.Database.open('main');
	var rowRRE = dbMainRRE.execute('SELECT COUNT(*) FROM relay_results WHERE race_id = ? AND leg_id = ?',raceId,legNum);
	if(rowRRE.isValidRow()){
		rrCount = rowRRE.field(0);	
	}
	rowRRE.close();
	return rrCount;
}

function getStartTimeForLeg(legNum){
	var startTime = -1;
	var rid = getRaceId();
	var dbMainSTFL = Titanium.Database.open('main');
	var sqlStmt;
	if((relayHasStarted()) && (relayResultExists(rid,legNum))){
		if(legNum == 0){
			sqlStmt = 'SELECT start_of_relay FROM settings WHERE setting_id = 1';
		}else{
			sqlStmt = 'SELECT leg_start FROM relay_results WHERE race_id = '+rid+' AND leg_id = '+legNum;
		}
		Ti.API.info(sqlStmt);
		if(sqlStmt != null){
			var rowSTFL = dbMainSTFL.execute(sqlStmt);
			if(rowSTFL.isValidRow()){
				startTime = rowSTFL.field(0); 
			}
			rowSTFL.close();
		}
	}else{
		Ti.API.info("Returning the assigned start time for the start time for leg 1.");
		startTime = getRaceStartTime(); // this is the assigned start time
	}
	return startTime;
};

function relayHasStarted(){
	var relayStarted = false;
	var rts = 0;
	var sor = 0;
	var cl = -1;
	var dbMainRHS = Titanium.Database.open('main');
	var rowRHS = dbMainRHS.execute('SELECT ready_to_start,start_of_relay,current_leg FROM settings WHERE setting_id = 1');
	if(rowRHS.isValidRow()){
		rts = rowRHS.field(0);
		sor = rowRHS.field(1);
		cl = rowRHS.field(2);
	}
	rowRHS.close();
	if(rts == 0){
		relayStarted = false;
	}else{
		if((cl < 1) || (cl > 36)){
			relayStarted = false;
		}else if(sor > 0){
			relayStarted = true;
		}else{
			relayStarted = false;
		}
	}
	return relayStarted;
};

function getFinishTimeForLeg(legNum){
	var finishTime = -1;
	var rid = getRaceId();
	var rowFTFL;
	try{
		var dbMainFTFL = Titanium.Database.open('main');
		var sqlStmt;
		if(relayResultExists(rid,legNum)){
			if(legNum == 0){
				sqlStmt = 'SELECT leg_start FROM relay_results WHERE race_id = '+rid+' AND leg_id = '+legNum;
			}else{
				sqlStmt = 'SELECT leg_end FROM relay_results WHERE race_id = '+rid+' AND leg_id = '+legNum;
			}
			rowFTFL = dbMainFTFL.execute(sqlStmt);
			if(rowFTFL.isValidRow()){
				finishTime = rowFTFL.field(0); 
			}else{
				Ti.API.info("invalid row from relay_results");
			}
		}
	}catch(ex){
		Ti.API.info('getFinishTimeForLeg Error: '+ex);
	}finally{
		if(rowFTFL != null){
			rowFTFL.close();
		}
	}
	return finishTime;
};

/*
 *  This function checks to see if there are legs that are before the current leg that are not synchronized
 *  with the server. Only legs that were recorded on this device call the setServerStatusForLeg method. The others
 *  call the requestServerStatusForLeg method.
 */

function checkForUnsentLegs(){
	if(Ti.Network.online == 1){ // don't bother checking if you don't have a network connection
		var currLeg = getCurrentLeg();
		var prevLegFinishTime = 0;
		var prevLegStartTime = 0;
		
		for(i = 1; i < currLeg+1; i++){
			var status = getNetworkStatusForLeg(i);	
			var currLegFinishTime = getFinishTimeForLeg(i);
			var currLegStartTime = getStartTimeForLeg(i);
			if(i > 1){
				prevLegFinishTime = getFinishTimeForLeg(i-1);
			}else{
				prevLegFinishTime = getActualStartOfRelay();
			}
			Ti.API.info("CFUL status for leg "+i+" is "+status);
			if (status === 0){ // this indicates missing information for a leg less than the current leg
				if((i > 1) && (prevLegFinishTime < 100000)){
					requestServerStatusForLeg(i-1);
				}
				requestServerStatusForLeg(i);
			} else if ((status === 1) || (status ===2)){ // this is a leg this device has recorded but is not on the server
				var ft = 0; 
				if(i == 0){
					ft = getActualStartOfRelay();
				} else {
					ft = getFinishTimeForLeg(i);
				}
				if((ft > 0) && (i > 0)){
					setServerStatusForLeg(i,ft);
					//updateServerWithCurrentLeg();
				}
			// } else if ((status === 3) && (i > 1) && (prevLegFinishTime !== currLegStartTime)){
				// setNetworkStatusForLeg(i,0);
				// requestServerStatusForLeg(i);
				// setNetworkStatusForLeg(i-1,0);				
				// requestServerStatusForLeg(i-1); 
			}
			//prevLegFinishTime = currLegFinishTime;
			//prevLegStartTime = currLegStartTime;	
		}
	}

};


/*
 *  This function returns the number of previous legs that have not been synchronized
 */
function getCountofMissingLegs(currLeg){
	var counter = 0;
	for(i = 0; i < currLeg; i++){
		var status = getNetworkStatusForLeg(i);	
		if (status == 0){ // this indicates missing information for a leg less than the current leg
			counter++;
		}	
	}
	return counter;	
}


/*
 *  This function requests the finish time for a given leg from the server
 *  and updates the local time if found
 */

function requestServerStatusForLeg(legNum){
	var xhrRSS = Titanium.Network.createHTTPClient(); //THIS SECTION IS NOT FINISHED  
	xhrRSS.onload = function(){
		Ti.API.info('requestServerStatusFor Leg function called, legNum: '+legNum);
		try{
			var doc = this.responseXML.documentElement;
			var elements = doc.getElementsByTagName("leg");
			Ti.API.info("elements: "+elements);
			var ln = elements.item(1).getAttribute("number");  // get the leg number
			var legNumber = parseInt(ln);
			var nextLegNum = legNumber + 1;
			var bTime = elements.item(0).text; // start time for the leg (finish time for the previous leg)
			var sTime = elements.item(1).text; // finish time for the leg
			//Ti.API.info("finish time for leg number "+ln+" is "+sTime+' and device finish time is: '+getFinishTimeForLeg(legNumber)); 
			//Ti.API.info("start time for leg number "+ln+" is "+bTime+' and device time is: '+getStartTimeForLeg(legNumber)); 
			
			var serverFinishTime = parseInt(sTime);
			var serverStartTime = parseInt(bTime);
			
			if((serverFinishTime > 0) && (getNetworkStatusForLeg(legNum) !== 3)) {
				var dbMainRSS = Titanium.Database.open('main');
				if(legNumber == 0){
					dbMainRSS.execute('UPDATE relay_results SET leg_start = ? WHERE race_id = ? AND leg_id = 1',serverFinishTime,getRaceId());
					dbMainRSS.execute('UPDATE settings SET start_of_relay = ? WHERE setting_id = 1',serverFinishTime);
				} else {
					dbMainRSS.execute('UPDATE relay_results SET leg_start = ?, leg_end = ? WHERE race_id = ? AND leg_id = ?',serverStartTime,serverFinishTime,raceId,legNumber);
					if(legNumber !== 36){
						dbMainRSS.execute('UPDATE relay_results SET leg_start = ? WHERE race_id = ? AND leg_id = ?',serverFinishTime,raceId,nextLegNum);
					}else{
						dbMainRSS.execute('UPDATE settings SET end_of_relay = ? WHERE setting_id = 1',serverFinishTime);
					}
				}
				if((serverFinishTime > 0) && (serverStartTime > 0) && (serverFinishTime > serverStartTime)){
					Ti.API.info('set network status to 3 for leg '+legNumber);
					// if actual has been set to true on server it will return start and finish times greater than 0
					setNetworkStatusForLeg(legNumber,3); // local and server values are synchronized
				}
			}
		}catch(e){
			Ti.API.info('requestServerStatusForLeg Error: '+e.error);
		}
	};

	xhrRSS.open('POST','http://sinequanonsolutions.appspot.com/teamsync');
	var data = {};
	data.procId = "6";
	var secret = getSharedSecret();
	data.ss = secret;
	var tpKey = getTeamPredictionKey();
	data.teamPredictionKey = tpKey;
	data.legNum = legNum;
	Ti.API.info("sending update request leg: "+legNum);
	Ti.API.info('finish time for leg: '+getFinishTimeForLeg(legNum));
	//if((Titanium.Network.online == 1) && (listenerStatus == 1) && (getNetworkStatusForLeg(legNum) !== 3) && (getFinishTimeForLeg(legNum) > 100000)){
	if((Titanium.Network.online == 1) && (getNetworkStatusForLeg(legNum) !== 3)){
		xhrRSS.send(data);
	}
		
};

/*
 *  This function updates the server with times that this device recorded
 */

function setServerStatusForLeg(legNum,timeStamp){
	var xhrRLU = Titanium.Network.createHTTPClient(); //THIS SECTION IS NOT FINISHED  
	xhrRLU.onload = function(){
		Ti.API.info('setServerStatusForLeg onload function called');
		try{
			var doc = this.responseXML.documentElement;
			var elements = doc.getElementsByTagName("leg");
			Ti.API.info("elements: "+elements);
			var ln = elements.item(0).getAttribute("number");  // get the leg number
			Ti.API.info("leg number: "+ln);
			var legNumber = parseInt(ln);
			var serverTime = elements.item(0).text;
			var dbMainRSS = Titanium.Database.open('main');
			if((serverTime == 1) && (getStartTimeForLeg(legNumber) > 0) && (getFinishTimeForLeg(legNumber) > 0)){
				setNetworkStatusForLeg(legNumber,3); // local and server values are synchronized
			}
		}catch(e){
			Ti.API.info('setServerStatusForLeg Error: '+e.error);
		}
	};

	xhrRLU.open('POST','http://sinequanonsolutions.appspot.com/teamsync');
	var data = {};
	data.procId = "5";
	data.ss = getSharedSecret();
	var tpKey = getTeamPredictionKey();
	data.teamPredictionKey = tpKey;
	var hoKey = getHandoffKey();
	data.handoffKey = hoKey;
	data.legNum = legNum;
	data.duration = timeStamp;
	if((Titanium.Network.online == 1) && (tpKey.length > 0)){
		xhrRLU.send(data);
		//Ti.API.info('setServerStatusForLeg request sent to server');
	}
};

function getHandoffKey(){
	var dbMainHOK = Ti.Database.open('main');
	var rowHOK = dbMainHOK.execute("SELECT handoff_key FROM handoff_status WHERE handoff_id = 1");
	var hok = "-1";
	if(rowHOK.isValidRow()){
		hok = rowHOK.field(0);	
	}
	rowHOK.close();
	//dbMainTPK.close();
	Titanium.App.Properties.setString('HandoffKey',hok);
	return hok;	
};


function getTeamPredictionKey(){
	var dbMainTPK = Ti.Database.open('main');
	var rowTPK = dbMainTPK.execute("SELECT team_prediction_key FROM team_identity WHERE team_id = 1");
	var tpk = "-1";
	if(rowTPK.isValidRow()){
		tpk = rowTPK.field(0);	
	}
	rowTPK.close();
	//dbMainTPK.close();
	Titanium.App.Properties.setString('TeamPredictionKey',tpk);
	return tpk;	
};

/*
 *  If the device is set to record handoffs, it will contact the server to let it know that it
 *  still has a network connection. 
 */ 
 
function sendHeartbeatToServer(){
	var hbNow = new Date();
	var hbUpdate = Titanium.Network.createHTTPClient();	
	hbUpdate.open('POST','http://sinequanonsolutions.appspot.com/teamsync');
	var hbData = {};
	hbData.procId = "3";
	hbData.ss = SHARED_SECRET_VALUE;
	hbData.handoffKey = handoffKey;
	hbData.heartbeat = hbNow.getTime();
	hbUpdate.send(hbData);
};

/*
 *  If the device is listening to the server, it will find out the last time the server heard
 *  from the recording device.
 */

function getHeartbeatFromServer(){
	var hbfSUpdate = Titanium.Network.createHTTPClient();
	hbfSUpdate.onload = function(){
		Ti.API.info('requestLegUpdate onload function called');
		try{
			var doc = this.responseXML.documentElement;
			var elements = doc.getElementsByTagName("last_heartbeat");
			Ti.API.info("elements: "+elements);
			var serverTime = elements.item(0).text;
			var dbMainhbfSUpdate = Titanium.Database.open('main');
			if(serverTime > 0){
				dbMainhbfSUpdate.execute('UPDATE network_status SET last_heartbeat = ? WHERE network_id = 1',serverTime);
			}
		}catch(e){
			Ti.API.info('getHeartbeatFromServer Error: '+e.error);
		}
	};

	hbfSUpdate.open('POST','http://sinequanonsolutions.appspot.com/teamsync');
	
	var hbfSData = {};
	hbfSData.procId = "4";
	hbfSData.ss = SHARED_SECRET_VALUE;
	hbfSData.handoffKey = handoffKey;
	hbfSUpdate.send(hbfSData);
};

function getLastHeartbeat(){
	var lastHeartbeat = 0;
	var dbMainLHB = Titanium.Database.open('main');
	var rowLHB = dbMainLHB.execute('SELECT last_heartbeat FROM network_status WHERE network_id = 1');
	if(rowLHB.isValidRow()){
		lastHeartbeat = rowLHB.field(0);	
	}
	rowLHB.close();
	return lastHeartbeat;
};

function handleHeartbeat(){
	if(activeStatus == 1){
		if(timeKeeper == 1){
			sendHeartbeatToServer();
		}else{
			getHeartbeatFromServer();
		}
	}
};

function getSetNumberForLegNum(legNum){
	var setNum = -1;
	if(legNum > 24) {
		setNum = legNum - 24;
	} else if(legNum > 12) {
		setNum = legNum - 12;
	} else {
		setNum = legNum;
	}
		
	return setNum;
	
};

function updateServerWithCurrentLeg(){
	Ti.API.info("called updateServerWithCurrentLeg");
	var uSWCLUpdate = Titanium.Network.createHTTPClient();
	uSWCLUpdate.open('POST','http://sinequanonsolutions.appspot.com/teamsync');
	
	var uSWCLData = {};
	uSWCLData.procId = "7";
	uSWCLData.ss = SHARED_SECRET_VALUE;
	uSWCLData.handoff_key = getHandoffKey();
	uSWCLData.prediction_key = getTeamPredictionKey();
	uSWCLUpdate.send(uSWCLData);	
};

function relayResultCleanup(){
	var dbMainrRC = Titanium.Database.open('main');
	var rowrRC = dbMainrRC.execute('SELECT leg_id, race_id, leg_start, leg_end FROM relay_results ORDER BY race_id,leg_id');
	var prevLeg = 0;
	var prevRid = -1;
	
	var lid = -1;
	var rid = -1;
	var ls = -1;
	var le = -1;
	var results = [];
	var counter = 0;
	while(rowrRC.isValidRow()){
		var result = [];
		lid = rowrRC.field(0);	// leg id
		rid = rowrRC.field(1);	// race id
		ls = rowrRC.field(2);	// leg start
		le = rowrRC.field(3); 	// leg end

		if(lid == prevLeg+1){
			result[0] = lid;
			result[1] = rid;
			result[2] = ls;
			result[3] = le; 
		}else if(lid == prevLeg+2){ // skipped a leg
			result[0] = prevLeg+1;
			result[1] = rid;
			result[2] = 0;
			result[3] = 0;
			results[counter] = result;
			counter++;
		}
		results[counter] = result;
		prevLeg = lid;
		counter++;
		if(counter > 36){
			break;
		}
		rowrRC.next();
	}
	rowrRC.close();	
	
	for(i = 0; i < results.length; i++){
		if(results[i][0] == 1){ // for leg id 1
			Ti.API.info('cleanup, leg '+results[i][0]+' start: '+ results[i][2]);
			var asor = getActualStartOfRelay();
			if(results[i][2] !== asor){
				dbMainrRC.execute('UPDATE relay_results SET leg_start = ? WHERE race_id = ? AND leg_id = 1',asor,results[i][1]);
			}
		} else if(results[i][0] > 1){
			// if the start time for one leg does not equal the end time of the previous, make the correction
			// if the end time has a network status of 1 or 3
			Ti.API.info('cleanup, leg '+results[i][0]+' start: '+ results[i][2]+', previous leg end:'+results[i-1][3]);
			if(results[i][2] !== results[i-1][3]){ 
					dbMainrRC.execute('UPDATE relay_results SET leg_start = ? WHERE race_id = ? AND leg_id = ?',results[i][2],results[i][1],results[i][0]);
			}
			// if the leg end is 0 and the next leg start is greater than 0, set the leg end to the next leg start
			if(results[i][3] == 0 && i < 36 && results.length > i && results[i+1][2] > 0){
				dbMainrRC.execute('UPDATE relay_results SET leg_end = ? WHERE race_id = ? AND leg_id = ?',results[i+1][2],results[i][1],results[i][0]);
			}

		} else {
			// if the leg end is 0 and the next leg start is greater than 0, set the leg end to the next leg start
			if(results[0][3] == 0 && results.length > 1 && results[1][2] > 0){
				dbMainrRC.execute('UPDATE relay_results SET leg_end = ? WHERE race_id = ? AND leg_id = ?',results[1][2],results[0][1],results[0][0]);
			}
		}		
	}
	
	
};

function deleteRelayResultRecord(legNum,rid){
	Ti.API.info('called deleteRelayResultRecord');
	var dbMaindRRR = Titanium.Database.open('main');
	dbMaindRRR.execute('DELETE FROM relay_result WHERE leg_id = ? AND race_id = ?',legNum,rid);
};

function raceLegCleanup(){
	var dbMainrLC = Titanium.Database.open('main');
	var rowrLC = dbMainrLC.execute('SELECT leg_number, race_id FROM race_leg ORDER BY race_id,leg_number');
	var prevLeg = -1;
	var prevRid = -1;
	while(rowrLC.isValidRow()){
		var lNum = rowrLC.field(0);
		var rId = rowrLC.field(1);	
		Ti.API.info('lNum: '+lNum +' rId: '+rId);
		if((lNum == prevLeg) && (rId == prevRid)) { // duplicate record, delete it
			//deleteRaceLegRecord(lNum,rId);
			// database locked, need to put results into array, close the database and then delete	
		}else{
			prevLeg = lNum;
			prevRid = rId;
		}
		rowrLC.next();
	}
	rowrLC.close();	
};

function deleteRaceLegRecord(legNum,rid){
	Ti.API.info('called deleteRaceLegRecord');
	var dbMaindRLR = Titanium.Database.open('main');
	dbMaindRLR.execute('DELETE FROM race_leg WHERE leg_number = ? AND race_id = ?',legNum,rid);
};


function formatDate()
{
	var date = new Date;
	var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
	if (date.getHours()>=12)
	{
		datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
	}
	else
	{
		datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
	}
	return datestr;
};

function retrieveRaceUpdate(){
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function(){
		Ti.API.info('getRaceUpdate onload function called');
		Ti.API.info('xml: ' + this.responseXML + ' text ' + this.responseText);
		try{
			var dbMainRU = Titanium.Database.open('main');
			var doc = this.responseXML.documentElement;
			Ti.API.info("doc: "+doc);
			var elements = doc.getElementsByTagName("sql");
			for(var i=0; i<elements.length; i++){
				var sql = elements.item(i).text;
				Ti.API.info("biz_logic - sql: "+sql);
				dbMainRU.execute(sql);
			}
		}catch(e){
			Ti.API.info('retrieveRaceUpdate Error: '+e.error);
		}
	};

	xhr.open('POST','http://sinequanonsolutions.appspot.com/raceupdate');
	var data = {};
	data.procid = "3";
	data.sharedsecret = getSharedSecret();
	if(Titanium.Network.online == 1){
		xhr.send(data);
	}
	
};

