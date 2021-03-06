Ti.include('biz_logic.js');

var actualStartOfRelay = 0;

function getProjections(){
	var raceId = getRaceId();
	var pArray = new Array();
	var prevLegStart = getActualStartOfRelay();
	
	for(i = 0; i < 36; i++){
		legNum = i+1;
		var legResult = getLegResult(raceId,legNum,prevLegStart);
		pArray[i] = legResult;
		prevLegStart = legResult.legEnd;
	}
	
	return pArray;
/*	var prevLegEnd = 0;  // leg end
	
	// query the results table and put actual result objects into the array
	dbMain = Titanium.Database.open('main');
	//var settingRow = dbMain.execute('SELECT assigned_team_start FROM settings WHERE setting_id = 1');
	
	var rowCounter = 1;
	
	var actualRows = dbMain.execute('SELECT leg_id,leg_start,leg_end FROM relay_results WHERE race_id = ? ORDER BY race_id',raceId);
	while(actualRows.isValidRow()){
		legObj = new Object();
		legObj.legNum = actualRows.field(0);
		legObj.state = "A"; // P stands for Projected, A stands for Actual
		legObj.legStart = actualRows.field(1);
		le = actualRows.field(2); // leg end
		if (le > 0) {
			legObj.legEnd = le;
			prevLegEnd = le;
		} else {
			break;
		}
		pArray[pArray.length] = legObj;

		rowCounter++;
		actualRows.next();
	}
	actualRows.close();
	// if the race hasn't started then we need to get the assigned start time
	if (prevLegEnd == 0){
		rowCounter = 1;
		var assignedStart = "12:00";
		var ready = 0;
		// get leg start from the settings table or start from noon today
		var rowSetting = dbMain.execute('SELECT ready_to_start,assigned_team_start,start_of_relay FROM settings WHERE setting_id = 1');
		if (rowSetting.isValidRow()){
			ready = rowSetting.field(0);
			assignedStart = rowSetting.field(1);
			var sor = rowSetting.field(2);
			if(ready === 1){
				actualStartOfRelay = sor;
			}else{
				actualStartOfRelay = 0;
			}
		}
		rowSetting.close();
		//Ti.API.info('assigned start: '+assignedStart);
		if((actualStartOfRelay > 0) && (ready === 1)){
			legStart = actualStartOfRelay;
		}else{
			var x = assignedStart.indexOf(":");
			var hour = 12; // default
			var min = 0;
			if (x != -1) { // a valid time string
				hour = parseInt(assignedStart.substring(0,x));
				min = parseInt(assignedStart.substring(x + 1));
				//Ti.API.info('hour: '+hour);
				//Ti.API.info('min: '+min);
			}
			var d = new Date();
			d.setDate(1);
			d.setHours(hour);
			d.setMinutes(min, 0, 0);
			legStart = d.getTime();
		}
		prevLegEnd = legStart;
	}
	
	while (rowCounter < 37){
		var ms = getProjectedRunnerTime(rowCounter,raceId);
		legObj = new Object();
		legObj.legNum = rowCounter;
		legObj.state = "P"; // P stands for Projected, A stands for Actual
		legObj.legStart = prevLegEnd; // in milliseconds from epoch
		legObj.legEnd = prevLegEnd + ms; // in milliseconds from epoch
		pArray[pArray.length] = legObj;
		
		prevLegEnd = prevLegEnd + ms;
		rowCounter++;
	}
	
	return pArray;
*/
}


function sendRaceProjections(teamPredictionKey,raceId,teamKey,handoffKey){
	Ti.API.info("sendRaceProjections - handoffKey: "+handoffKey);
	Ti.include('constants.js');
	var projArray = getProjections();

	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function(){
		Ti.API.info("hit onload function of sendRaceProjections")
		try{
			Ti.API.info("sendProjections result: "+this.responseText);
			var doc = this.responseXML.documentElement;
			var content = doc.getElementsByTagName("row");
			var tpk = content.item(0).text; // team_prediction_key
			Ti.API.info("tpk: "+tpk);
			if(tpk.length > 10){
				dbMain.execute("UPDATE team_identity SET team_prediction_key = ? WHERE team_id = 1",tpk);
			}
			clearInterval(projectionStopWatch);
		}catch(ex){
			Ti.API.info('sendRaceProjections Error: '+ex);
		}
	};
	xhr.open('POST','http://sinequanonsolutions.appspot.com/predictor/upload');

	var data = {};
	data.procid = "1";
	data.shared_secret = SHARED_SECRET_VALUE;
	data.prediction_key = teamPredictionKey;
	data.race_id = getRaceId();
	data.team_key = teamKey;
	data.handoff_key = handoffKey;
	data.current_leg = getCurrentLeg();
	Ti.API.info("data.handoff_key: "+handoffKey);
	data.team_start = getActualStartOfRelay();

	for(var i=0; i < 36; i++){
		var x = i+1;
		data["leg"+x] = projArray[i].state+projArray[i].legEnd;
	}
	if((teamPredictionKey.length > 10) && (handoffKey.length > 10) && (teamKey.length > 10) && (Titanium.Network.online == 1)){
		xhr.send(data);
	}else{
		var rowTP = dbMain.execute("SELECT team_prediction_key, team_key FROM team_identity WHERE team_id = 1");
		if(rowTP.isValidRow()){
			teamPredictionKey = rowTP.field(0);
			teamKey = rowTP.field(1);
		}
		rowTP.close();
		var rowHO = dbMain.execute("SELECT handoff_key FROM handoff_status WHERE handoff_id = 1");
		if(rowHO.isValidRow()){
			handoffKey = rowHO.field(0);
		}
		rowHO.close();

		Ti.API.info('ERROR: send Race projections has a problem!');
		Ti.API.info('tpk: '+teamPredictionKey);
		Ti.API.info('hok: '+handoffKey);
		Ti.API.info('tk: '+teamKey);
		
		data.prediction_key = teamPredictionKey;
		data.team_key = teamKey;
		data.handoff_key = handoffKey;
		if(Titanium.Network.online == 1){
			xhr.send(data);
		}
	}

};

