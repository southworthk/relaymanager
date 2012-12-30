var awmf = 0;
var df = 0;
var egf = 0;
var elf = 0;
var rsf = 0;
var sf = 0;
var yi = 0;


function getDisplayTime(ms){
	currentTime = ms;
	var displayStr = '00:00:00';
	try{
		hours = Math.floor(currentTime / 3600000);
		currentTime = currentTime - (hours * 3600000);
		minutes = Math.floor(currentTime / 60000);
		currentTime = currentTime - (minutes * 60000);
		seconds = Math.floor(currentTime / 1000);
		
		if (seconds == 60){
			minutes++;
			seconds = 0;
		}

		if (minutes == 60){
			hours++;
			minutes = 0;
		}
		//currentTime = currentTime - (seconds * 1000);
		//tenths = Math.round(currentTime / 100);
		hrStr = (hours < 10) ? '0'+hours : ''+hours;
		minStr = (minutes < 10) ? '0'+minutes : ''+minutes;
		secStr = (seconds < 10) ? '0'+seconds : ''+seconds;
		
	 	
		//var displayString = hrStr+':'+minStr+':'+secStr+'.'+tenths;
		displayStr = hrStr+':'+minStr+':'+secStr;
	} catch(err){
		Ti.API.info('Error thrown by getDisplayTime() function: '+err);
		displayStr = '00:00:00';
	}
	return displayStr;
}


function getProjectedRunnerTime(legNum,raceId){
	var rid = raceId; // race id
	var snum = 0; // set number
	var dist = 0; // leg distance
	var eg = 0; // elev gain
	var el = 0; // elev loss
	var ts = 0; // 10k speed
	var mw = 0; // miles per week
	
	// retrieve prediction factors if not previously selected
	if(yi == 0){
		var pfRow = dbMain.execute('SELECT avg_mileage_factor, dist_factor, elev_gain_factor, elev_loss_factor, rspeed_factor, set_factor, y_intercept FROM prediction_factors WHERE pf_id = 1');
		if(pfRow.isValidRow()){
			awmf = pfRow.field(0);
			df = pfRow.field(1);
			egf = pfRow.field(2);
			elf = pfRow.field(3);
			rsf = pfRow.field(4);
			sf = pfRow.field(5);
			yi = pfRow.field(6);
		}
        pfRow.close();
	}
	

	// select statistics for current leg
	var rowLeg = dbMain.execute('SELECT set_number,distance,elev_gain,elev_loss FROM race_leg WHERE race_id = ? AND leg_number = ?',rid,legNum);
	if (rowLeg.isValidRow()){
		snum = rowLeg.field(0);
		dist = rowLeg.field(1);
		eg = rowLeg.field(2);
		el = rowLeg.field(3);
	}
	rowLeg.close();
	
	
	// select runner properties for current leg
	var rowRunner = dbMain.execute('SELECT ten_k_speed, miles_per_week FROM runner WHERE set_id = ?',snum);
	if (rowRunner.isValidRow()){
		ts = rowRunner.field(0); // in mph
		mw = rowRunner.field(1);
	}
	rowRunner.close();
	// get relative distance in miles
	//var rd = dist + (eg/1000) - (el/2000);
	//ms = (rd / ts) * 3600000;
	
	var setIndex = 3;
	if(legNum < 13){
		setIndex = 1;
	}else if(legNum < 25){
		setIndex = 2;
	}
	
	// multiple regression based algorithm
/*	Ti.API.info("yi: "+yi);
	Ti.API.info("awmf: "+awmf);
	Ti.API.info("mw: "+mw);
	Ti.API.info("df: "+df);
	Ti.API.info("dist: "+dist);
	Ti.API.info("egf: "+egf);
	Ti.API.info("eg: "+eg);
	Ti.API.info("elf: "+elf);
	Ti.API.info("el: "+el);
	Ti.API.info("rsf: "+rsf);
	Ti.API.info("ts: "+ts);
	Ti.API.info("sf: "+sf);
	Ti.API.info("snum: "+setIndex);
*/
	ms = Math.round((yi + (awmf * mw) + (df * dist) + (egf * eg) + (elf * el) + (rsf * ts) + (sf * setIndex)) * 1000);
//	Ti.API.info("ms: "+ms);
	//Ti.API.info('Leg number '+legNum+': '+getDisplayTime(ms)+' RSpeed: '+ts);
	return ms;
}


function getPredictedFinish(legNum,raceId){
	var ms = getProjectedRunnerTime(legNum,raceId);
	
	if (ms > 0){
		return getDisplayTime(ms);
	} else {
		return '00:00:00';
	}
}


function getRaceTotalTime(){
	var row = dbMain.execute('SELECT start_of_relay,end_of_relay FROM settings WHERE setting_id = 1');
	var st = 0;
	var et = 0;
	if (row.isValidRow()){
		st = row.field(0);
		et = row.field(1);
	}
	if(et == 0){
		et = getFinishTimeForLeg(36);
		if(et > 0){
			dbMain.execute('UPDATE settings SET end_of_relay = ? WHERE setting_id = 1',et);
		}
	}
	
	Ti.API.info("start time: "+st);
	Ti.API.info("end time: "+et);
    row.close();
	ms = et - st;
	if (ms > 0){
		return getDisplayTime(ms);
	} else {
		return '00:00:00';
	}
	
}

function getFormattedTime(ms){ 
	var a_p = "";
	var d = new Date();
	d.setTime(ms);
	var curr_hour = d.getHours();
	if (curr_hour < 12) {
		a_p = "AM";
	} else {
		a_p = "PM";
   }
	
	if (curr_hour == 0) {
		curr_hour = 12;
	}
	if (curr_hour > 12) {
		curr_hour = curr_hour - 12;
	}

	var curr_min = d.getMinutes();
	curr_min = curr_min + "";

	if (curr_min.length == 1) {
		curr_min = "0" + curr_min;
	}
	
	var curr_sec = d.getSeconds();
	curr_sec = curr_sec + "";
	
	if (curr_sec.length == 1){
		curr_sec = "0" + curr_sec;
	}

	return curr_hour + ":" + curr_min + ":" + curr_sec + " " + a_p;
}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function pad(number, length) {
	var str = '' + number;
	while (str.length < length) {
		str = '0' + str;
	}
	return str;
}

function speedToPace(mph){
	minPace = Math.floor(60 / mph);
	minFraction = roundNumber(((60 / mph) - minPace),4);
	secPace = pad(Math.round(minFraction * 60),2);
	if (secPace == '60'){
		minPace++;
		secPace = '00';
	}
	return minPace + ':' + secPace;
}

/*
 *  paceStr should be in the format 08:00
 */
function paceToSpeed(paceStr){ 
	if(paceStr.length == 5){
		var minStr = paceStr.substring(0,2);
		minStr = (minStr.charAt(0) == '0') ? minStr.substring(1) : minStr;
		var min = parseInt(minStr);
		var secStr = paceStr.substring(3);
		secStr = (secStr.charAt(0) == '0') ? secStr.substring(1) : secStr;
		var minFraction = (parseInt(secStr))/60;
		min = min + minFraction;
		return 60 / min;	
	}else{
		return 6.0; // 6 mph or 10:00 pace is the default
	}
}

function getRunnerFirstName(setId){ // setId is really the set number
	var fn = 'Not Assigned';

	var row = dbMain.execute('SELECT first_name FROM runner WHERE set_id = ?',setId);
	if(row.isValidRow()){
		fn = row.field(0);
	}
	row.close();
	return fn;
}

function getRunnerLastInitial(setId){
	var li = '';
	var ln = '';

	var row = dbMain.execute('SELECT last_name FROM runner WHERE set_id = ?',setId);
	if(row.isValidRow()){
		ln = row.field(0);
	}
	row.close();
	if((ln != null) && (ln.length > 0)){
		li = ln.charAt(0);
	}
	return li;
	
}

function getRunner(setId){ // setId is really the set number
	var fn = 'Not Assigned';
	var ln = '';

	var dbMainGR = Titanium.Database.open('main');
	var row = dbMainGR.execute('SELECT first_name,last_name FROM runner WHERE set_id = ?',setId);
	if(row.isValidRow()){
		fn = row.field(0);
		ln = row.field(1);
	}
	row.close();
	return fn + ' ' + ln;
}

function getPace(dist,time){
	var hours = time / 3600000;
	var mph = dist/hours;
	return speedToPace(mph);
}

function getPaceDisplay(time,dist){
	var dispStr = "00:00";
	if((dist > 0) && (time > 0)){
		dispStr = getPace(dist,time);
	}
	return dispStr;
}

function getDifficultyAbbrv(rating){
	var diff = parseInt(rating,10);
	var diffStr = '';
	switch(diff){
	case 1:
		diffStr = 'E';
		break;
	case 2:
		diffStr = 'M';
		break;
	case 3:
		diffStr = 'H';
		break;
	case 4:
		diffStr = 'VH';
		break;
	}
	return diffStr;
}

function getDifficulty(rating){
	var diff = parseInt(rating,10);
	var diffStr = '';
	switch(diff){
	case 1:
		diffStr = 'Easy';
		break;
	case 2:
		diffStr = 'Moderate';
		break;
	case 3:
		diffStr = 'Hard';
		break;
	case 4:
		diffStr = 'Very Hard';
		break;
	}
	return diffStr;
}

function getActualTime(legNum,raceId){
	var duration = 0;
	var legStart = 0;
	var legEnd = 0;
	var atRow = dbMain.execute("SELECT leg_start,leg_end FROM relay_results WHERE race_id = ? AND leg_id = ?",raceId,legNum);	
	if(atRow.isValidRow()){
		legStart = atRow.field(0);
		legEnd = atRow.field(1);
	}
	if(legEnd > legStart){
		duration = legEnd - legStart;
	}else{
		duration = 0;
	}
	
	return duration;
}

function getActualDisplayTime(legNum,raceId){
	var ms = getActualTime(legNum,raceId);
	return getDisplayTime(ms);
}
