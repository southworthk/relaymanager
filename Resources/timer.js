var win = Titanium.UI.currentWindow;
var terTextColor = '#4A4344'; // tertiary text color
var secTextColor = 'DDDDDD';
var enabledForHandoff = false;
var teamPredictionKey = "";
var trackingEnabled = 0;

win.barColor = 'black';
var dbMain;

var raceIsOn = 0;
var raceIsOver = 0;
var legStartTime = 0;
//var stopWatch;
var raceId = -1;
var currentLeg = -1;
var dCounter = 0;
var eCounter = 0;
var raceStartTime = 0;
var raceEndTime = 0;
var endOfRelay = 0;

var currentTime = 0;
var hours = 0;
var minutes = 0;
var seconds = 0;
var tenths = 0;
var hrStr = '';
var minStr = '';
var secStr = '';
var stopWatch;
var projectionStopWatch;
var listenerStopWatch;
var synchStopWatch; // this stop watch checks the server periodically to make sure that it is up to date

var	activeStatus = 0; // this flag indicates whether data sharing has been turned on
var	handoffKey = "-1";
var	timeKeeper = 0;
var	listenerStatus = 0;
var teamKey = "-1";

var targetEnum = {
	TIMER: 0,
	PREVIOUS: 1,
	NEXT: 2
};

// previous leg labels
var p_distanceLabel;
var p_elevChangeLabel;
var p_predictedFinishLabel;
var p_timerLabel;
var p_legLabel;
var p_runnerLabel;
var p_paceLabel;

// next leg labels
var n_distanceLabel;
var n_elevChangeLabel;
var n_predictedFinishLabel;
var n_timerLabel;
var n_legLabel;
var n_runnerLabel;

//var displayString = hrStr+':'+minStr+':'+secStr+'.'+tenths;
Ti.include('constants.js');
Ti.include('projections.js');
Ti.include('biz_logic.js');

var nextBtn = Titanium.UI.createButton({
	title:'Next'
});

win.setRightNavButton(nextBtn);

nextBtn.addEventListener('click',function(e){
	var w = Ti.UI.createWindow({
		backgroundColor:'777777'
	});
	
	n_distanceLabel = Ti.UI.createLabel({
		text:'Placeholder for Distance',
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		color:secTextColor,
		top:210,
		width:'auto',
		height:'auto'	
	}); 
	
	n_elevChangeLabel = Ti.UI.createLabel({
		text:'Placeholder for Elevation',
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		color:secTextColor,
		top:240,
		width:'auto',
		height:'auto'	
	});
	
	n_predictedLabel = Ti.UI.createLabel({
		text:'Predicted Finish',
		font:{fontSize:12,fontFamily:'Helvetica Neue'},
		color:secTextColor,
		top:88,
		width:'auto',
		height:'auto'	
	});


	n_predictedFinishLabel = Ti.UI.createLabel({
		text:'Placeholder for Predicted Finish',
		font:{fontSize:55,fontFamily:'Helvetica Neue'},
		color:'#fff',
		top:95,
		width:'auto',
		height:'auto'	
	});
	
	n_legLabel = Ti.UI.createLabel({
		text:'Leg 1',
		font:{fontSize:30,fontFamily:'Helvetica Neue'},
		color:'#000',
		top:50,
		width:'auto',
		height:'auto'
	});

	n_runnerLabel = Ti.UI.createLabel({
		text:'Runner Name',
		font:{fontSize:30,fontFamily:'Helvetica Neue'},
		color:'#000',
		top:160,
		width:'auto',
		height:'auto'
	});
	
	
	var b = Ti.UI.createButton({
		title:'Close',
		top:340, 
		height:40,
		width: 225
	});
	b.addEventListener('click',function()
	{
		w.close();
	});
	w.add(n_distanceLabel);
	w.add(n_elevChangeLabel);
	w.add(n_predictedLabel);
	w.add(n_predictedFinishLabel);

	w.add(n_legLabel);
	//w.add(n_timerLabel);
	w.add(n_runnerLabel);
	w.add(b);
	
	//TODO: PASS IN VALUES
	Ti.API.info('next window setup, currentLeg: '+currentLeg);
	var nextLegNum = currentLeg + 1;
	if((nextLegNum === 0) || (nextLegNum === 1)){
		nextLegNum = 2;
	}
	n_legLabel.text = 'Leg '+nextLegNum+' Preview';
	var n_setNum = getSetNumberForLegNum(nextLegNum);

	n_runnerLabel.text = getRunner(n_setNum);
	setDistanceLabel(nextLegNum,targetEnum.NEXT);
	//n_paceLabel.text = getActualPace(prevLegNum,raceId,p_ms);
	w.open({modal:true,modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_FLIP_HORIZONTAL,modalStyle:Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN,navBarHidden:true});
});

var prevBtn = Titanium.UI.createButton({
	title:'Prev'
});

win.setLeftNavButton(prevBtn);

prevBtn.addEventListener('click',function(e){
	var w = Ti.UI.createWindow({
		backgroundColor:'777777'
	});
	
	p_distanceLabel = Ti.UI.createLabel({
		text:'Placeholder for Distance',
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		color:secTextColor,
		top:195,
		width:'auto',
		height:'auto'	
	}); 
	
	p_elevChangeLabel = Ti.UI.createLabel({
		text:'Placeholder for Elevation',
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		color:secTextColor,
		top:225,
		width:'auto',
		height:'auto'	
	});
	
	p_predictedFinishLabel = Ti.UI.createLabel({
		text:'Placeholder for Predicted Finish',
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		color:secTextColor,
		top:255,
		width:'auto',
		height:'auto'	
	});
	
	p_paceLabel = Ti.UI.createLabel({
		text:'Placeholder for Pace',
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		color:secTextColor,
		top:285,
		width:'auto',
		height:'auto'	
	});
	
	p_timerLabel = Ti.UI.createLabel({
		text:'00:00:00',
		font:{fontSize:55,fontFamily:'Helvetica Neue'},
		color:'#fff',
		top:80,
		width:'auto',
		height:'auto'
	});

	p_legLabel = Ti.UI.createLabel({
		text:'Leg 1',
		font:{fontSize:30,fontFamily:'Helvetica Neue'},
		color:'#000',
		top:50,
		width:'auto',
		height:'auto'
	});

	p_runnerLabel = Ti.UI.createLabel({
		text:'Runner Name',
		font:{fontSize:30,fontFamily:'Helvetica Neue'},
		color:'#000',
		top:145,
		width:'auto',
		height:'auto'
	});
	
	
	var b = Ti.UI.createButton({
		title:'Close',
		top:340, 
		height:40,
		width: 225
	});
	b.addEventListener('click',function()
	{
		w.close();
	});
	w.add(p_distanceLabel);
	w.add(p_elevChangeLabel);
	w.add(p_predictedFinishLabel);
	w.add(p_paceLabel);
	w.add(p_legLabel);
	w.add(p_timerLabel);
	w.add(p_runnerLabel);
	w.add(b);
	
	//TODO: PASS IN VALUES
	Ti.API.info('prev window setup, currentLeg: '+currentLeg);
	Ti.API.info('endOfRelay: '+endOfRelay);
	var prevLegNum = currentLeg - 1;
	// check to see if race is over, if it is show leg 36 
	if((endOfRelay > 0) && (prevLegNum > 35)){
		prevLegNum = 36;	
	}
	p_legLabel.text = 'Leg '+prevLegNum+' Stats';
	var p_setNum = getSetNumberForLegNum(prevLegNum);
	// get elapsed time
	var p_ms = 0;
	var rowET = dbMain.execute("SELECT leg_start,leg_end FROM relay_results WHERE leg_id = ? AND race_id = ?",prevLegNum,raceId);
	if(rowET.isValidRow()){
		var p_ls = rowET.field(0);
		var p_le = rowET.field(1);
		p_ms = p_le - p_ls;
	}
	rowET.close();
	p_timerLabel.text = getDisplayTime(p_ms);
	p_runnerLabel.text = getRunner(p_setNum);
	setDistanceLabel(prevLegNum,targetEnum.PREVIOUS);
	p_paceLabel.text = getActualPace(prevLegNum,raceId,p_ms);
	w.open({modal:true,modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_FLIP_HORIZONTAL,modalStyle:Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN,navBarHidden:true});
});

function getActualPace(legNumber,raceId,elapsedTime){
	var dist = 0;
	var rowPace = dbMain.execute("SELECT distance FROM race_leg WHERE race_id = ? AND leg_number = ?",raceId,legNumber);
	if(rowPace.isValidRow()){
		dist = rowPace.field(0);	
	}
	rowPace.close();
	return "Actual Pace: "+getPace(dist,elapsedTime)+" per mile";
};

/*
 *  This function checks the server periodically to see if new handoffs have been recorded
 *  It will only check if the device is in listening mode. 
 */
function checkForUpdate(){
	var xhrUpdate = Titanium.Network.createHTTPClient();
	xhrUpdate.onload = function(){
		var raceId = getRaceId();
		try{
				Ti.API.info("checkForUpdate result: "+this.responseText);
				var cLeg = getCurrentLeg();
				var doc = this.responseXML.documentElement;
				var elements = doc.getElementsByTagName("leg");
				Ti.API.info("checkForUpdate elements: "+elements);
	
				for(var i=0; i<elements.length; i++){
					var ln = elements.item(i).getAttribute("number");  // get the leg number
					Ti.API.info("leg number: "+ln);
					var legNumber = parseInt(ln);
					var legStart = elements.item(i).getAttribute("begin");
					Ti.API.info("checkForUpdate, legStart: "+legStart+", currentLeg: "+cLeg);
					if(legNumber >= cLeg){
						if(legNumber == 0){
							Ti.API.info("IGH, 1a:");
							legStart = elements.item(0).text;
							dbMain.execute("UPDATE settings SET ready_to_start = 1, start_of_relay = ?,start_of_leg = ?,current_leg = 1 WHERE setting_id = 1",legStart,legStart); 
							dbMain.execute("DELETE FROM relay_results WHERE race_id = ? AND leg_id = 1",raceId);
							dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES (?,1,?,0)",raceId,legStart);
							currentLeg = 1;
							legStartTime = legStart;
							currentTime = 0;
							legLabel.text = 'Leg '+1;
							var setNum = getSetNumberForLegNum(1);
							//Ti.API.info('executed, checkForUpdate: '+currentLeg);
							runnerLabel.text = getRunner(setNum);
							setDistanceLabel(1,targetEnum.TIMER);
							Titanium.App.Properties.setInt('CurrentLeg',1);
							Titanium.App.Properties.setDouble('StartOfLeg',legStart);
							Ti.API.info("IGH, 2a:");
	
						}
						
						Ti.API.info('IGH, raceId: '+raceId);	
						Ti.API.info('IGH, legNumber: '+legNumber);
						Ti.API.info('IGH, getNetworkStatusForLeg: '+getNetworkStatusForLeg(legNumber));
						Ti.API.info('IGH, relay result start time: '+getStartTimeForLeg(legNumber));
						Ti.API.info('IGH, relay result finish time: '+getFinishTimeForLeg(legNumber));
						var networkLegStatus = getNetworkStatusForLeg(legNumber);
						if((raceId > 0) && (legNumber > 0) && networkLegStatus !== 3){
							Ti.API.info("IGH, 1b:");
							if(legNumber == 1){
								getActualStartTimeFromServer();
							}
	
							var ct = elements.item(i).text; // finish time, need to record for start of next leg
							Ti.API.info("finish time: "+ct+" for leg "+legNumber);
							if(ct == null){
								ct = 0;
							}
							dbMain.execute("DELETE FROM relay_results WHERE race_id = ? AND leg_id = ?",raceId,legNumber);
							dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES (?,?,?,?)",raceId,legNumber,legStart,ct);
							legNumber++;
							advanceLegNumber(ct,legNumber);
						}else if((cLeg == legNumber) && networkLegStatus == 3){
							ct = getFinishTimeForLeg(legNumber);
							legNumber++;
							advanceLegNumber(ct,legNumber)
						}
					} else if(cLeg == 37){ // if(legNumber >= cLeg) // kms
							var legEnd = elements.item(i).text;
							if(legEnd > 100000){
								dbMain.execute("DELETE FROM relay_results WHERE race_id = ? AND leg_id = 36",raceId);
								dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES (?,36,?,0)",raceId,legStart,legEnd);
								recordEndOfRace(legEnd);
							}
					}
	
				} // for(var i=0;
					
				display();
			//}
		}catch(ex){
			Ti.API.info('checkForUpdate Error: '+ex);
		}
	};
	
	xhrUpdate.open('POST','http://sinequanonsolutions.appspot.com/teamsync');

	var data = {};
	data.procId = "0";
	data.ss = SHARED_SECRET_VALUE;
	data.teamPredictionKey = teamPredictionKey;
	data.handoffKey = handoffKey;
	Ti.API.info("checking for update, currentLeg: "+currentLeg);
	data.currentLeg = currentLeg;
	if((raceIsOver !== 1) && (Titanium.Network.online == 1)){
		xhrUpdate.send(data);
	}else{
		clearInterval(listenerStopWatch);
	}
};

/*
 *  This function advances the legNumber as the result of an update from the server
 *  parameters
 *  ct: currentTime
 *  legNumber
 */
function advanceLegNumber(ct,legNumber){
	if(raceId == -1){
		raceId = getRaceId();
	}
	if(legNumber !== 37){
		dbMain.execute("UPDATE settings SET start_of_leg = ?,current_leg = ? WHERE setting_id = 1",ct,legNumber);
		dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES (?,?,?,0)",raceId,legNumber,ct);
		currentLeg = legNumber;
		legStartTime = ct;
		currentTime = parseInt(ct);
		legLabel.text = 'Leg '+legNumber;
		var setNum = getSetNumberForLegNum(currentLeg);
		runnerLabel.text = getRunner(setNum);
		setDistanceLabel(currentLeg,targetEnum.TIMER);
		Titanium.App.Properties.setInt('CurrentLeg',currentLeg);
		Titanium.App.Properties.setDouble('StartOfLeg',currentTime);
	} else {
		currentLeg = 37;
		legStartTime = elements.item(36).text;
		recordEndOfRace(ct);
	}	
};

/*
 * checks for update of finish time of the current leg on the server
 */

function checkForUpdate_deprecated(){
	var xhrUpdate = Titanium.Network.createHTTPClient();
	xhrUpdate.onload = function(){
		var raceId = getRaceId();
		try{
			//if(getCurrentLeg() !== 37){
				//Ti.API.info("checkForUpdate result: "+this.responseText);
				var doc = this.responseXML.documentElement;
				//var content = doc.getElementsByTagName("row");
				var elements = doc.getElementsByTagName("leg");
				Ti.API.info("elements: "+elements);
	
				for(var i=0; i<elements.length; i++){
					var ln = elements.item(i).getAttribute("number");  // get the leg number
					Ti.API.info("leg number: "+ln);
					var legNumber = parseInt(ln);
					Ti.API.info("raceId: "+raceId);
					Ti.API.info("getNetworkStatusForLeg: "+getNetworkStatusForLeg(legNumber));
					if((raceId > 0)(legNumber > 0) && (getNetworkStatusForLeg(legNumber) !== 3)){
							// legStartTime = startingTime;
							// currentLeg = 1;
							// Titanium.App.Properties.setInt('CurrentLeg',currentLeg);
							// Titanium.App.Properties.setDouble('StartOfLeg',currentTime);
							// if(legStartTime > 0){
								// setNetworkStatusForLeg(0,3); // start of race synchronized with server
							// }
						//} else if((legNumber > 1) && (raceIsOver == 0)) {
						
							var legStart = elements.item(i).getAttribute("begin");
							if(legNumber == 1){
								dbMain.execute("UPDATE settings SET ready_to_start = 1, start_of_relay = ?,start_of_leg = ?,current_leg = 1 WHERE setting_id = 1",legStart,legStart); 
							}


							var ct = elements.item(i).text; // finish time, need to record for start of next leg
							Ti.API.info("ct: "+ct);
							if(ct == null){
								ct = 0;
							}
							//recordStartOfLeg(legNumber,ct);
							//if(raceId > 0){
								dbMain.execute("DELETE FROM relay_results WHERE race_id = ? AND leg_id = ?",raceId,legNumber);
								dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES (?,?,?,?)",raceId,legNumber,legStart,ct);
								legNumber++;
								if(legNumber !== 37){
									dbMain.execute("UPDATE settings SET start_of_leg = ?,current_leg = ? WHERE setting_id = 1",ct,legNumber);
									currentLeg = legNumber;
									legStartTime = ct;
									currentTime = ct;
									legLabel.text = 'Leg '+legNumber;
									var setNum = getSetNumberForLegNum(currentLeg);
									Ti.API.info('recordstartofleg, setnum: '+setNum);
									runnerLabel.text = getRunner(setNum);
									setDistanceLabel(currentLeg,targetEnum.TIMER);
									Titanium.App.Properties.setInt('CurrentLeg',currentLeg);
									Titanium.App.Properties.setDouble('StartOfLeg',currentTime);
									
									// if this device recorded the leg, don't assume that the timestamp from the server is correct
									//if((getNetworkStatusForLeg(legNumber) !== 1) && (getFinishTimeForLeg(legNumber) > 0) && (getStartTimeForLeg(legNumber) > 0)){  
									//	setNetworkStatusForLeg(legNumber,);
									//	Ti.API.info('Timer: set network status to 3 for leg '+legNumber);
									//}
								} else {
									currentLeg = 37;
									legStartTime = elements.item(36).text;
									//Ti.API.info('it got here: 3a');
									recordEndOfRace(ct);
								}
							//}			
							//currentLeg = legNum;
						//} // if(legNumber
					} // if(getNetworkStatusForLeg(legNumber))
	
				} // for(var i=0;
					
				// TEST TEST TEST
	/*			var rowC = dbMain.execute('SELECT current_leg,start_of_leg FROM settings WHERE setting_id = 1');
				if (rowC.isValidRow()){
					currentLeg = rowC.field(0);
					legStartTime = rowC.field(1);
				}
				rowC.close();
	*/
	/*			if((raceId > 0) && (currentLeg > 0)){
					dbMain.execute("DELETE FROM relay_results WHERE race_id = ? AND leg_id = ?",raceId,currentLeg);
					dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES (?,?,?,?)",raceId,currentLeg,legStartTime,0);
					Ti.API.info("deleted race results for current leg and created relay results for current leg");
				}
	*/
				display();
			//}
		}catch(ex){
			Ti.API.info('Deprecated Error: '+ex);
		}
		//Ti.API.info('legStartTime: '+legStartTime);
	};
	
	xhrUpdate.open('POST','http://sinequanonsolutions.appspot.com/teamsync');

	var data = {};
	data.procId = "0";
	data.ss = SHARED_SECRET_VALUE;
	data.teamPredictionKey = teamPredictionKey;
	data.handoffKey = handoffKey;
	Ti.API.info("checking for update, currentLeg: "+currentLeg);
	data.currentLeg = currentLeg;
	if((raceIsOver !== 1) && (Titanium.Network.online == 1)){
		xhrUpdate.send(data);
	}else{
		clearInterval(listenerStopWatch);
	}
};


function display(){
	stopWatch = setInterval(function()
	{
		//Ti.API.info('legStartTime: '+legStartTime);
		//Ti.API.info('currentLeg: '+currentLeg);
		var now = new Date();
		var ms = now.getTime() - legStartTime;
		if (ms > MILLISECONDS_PER_DAY){
			Ti.API.info('display: too much time');
			if(relayHasStarted()){
				if(currentLeg == 37){
					clearInterval(stopWatch);
					clearInterval(listenerStopWatch);
					showEndOfRaceDisplay();
				}else{
					timerLabel.hide();
					noTimerLabel.show();
				}
			}else{
				clearInterval(stopWatch);
				clearInterval(listenerStopWatch);
				timerLabel.text = '00:00:00';
				noTimerLabel.hide();
				timerLabel.show();
			}
		}else{
			try{
				if (currentLeg == -1){
					clearInterval(stopWatch);
					clearInterval(listenerStopWatch);
					timerLabel.text = '00:00:00';
					
				} else {
					timerLabel.text = getDisplayTime(ms);
				}
			}catch(err){
				Ti.API.info('Error thrown by display() function: '+err);
			}
			timerLabel.show();
			noTimerLabel.hide();
		}
	},500);

};


// DEPRECATED
function projectionTimer(){
	//sendRaceProjections(teamPredictionKey,raceId,teamKey,handoffKey);
/*	projectionStopWatch = setInterval(function()
	{
		if(Ti.Network.online == 1){
			Ti.API.info("projectionTimer, sending projections");
			Ti.API.info("tpk: "+teamPredictionKey);
			Ti.API.info("raceId: "+raceId);
			Ti.API.info("teamKey: "+teamKey);
			Ti.API.info("handoffKey: "+handoffKey)
			sendRaceProjections(teamPredictionKey,raceId,teamKey,handoffKey);			
		}
	},30000); 
*/	
};


function listenerTimer(){
	listenerStopWatch = setInterval(function(){
		if(Ti.Network.online == 1){
			networkConnectionLabel.text = 'Network status: connected '+getTime();
			checkForUpdate();
		}else{
			networkConnectionLabel.text = 'Network status: not connected';
		}
	},120000); 	
};


/*
 *  This is the timer that handles all synchronization issues with the server, for both the listener
 *  and recorder. If sharing is enabled this timer should be running.
 */
function synchronizationTimer(){
	Ti.API.info('hit synchronization timer');
	synchStopWatch = setInterval(function(){
		if(Ti.Network.online == 1){ // if connected to network, if sharing enabled, if race is on
			// the following is the list of synchronization methods
			checkForUnsentLegs();
			handleHeartbeat();			
		}
	},160000); // every two minutes	
};


function setDistanceLabel(legNum,target){
	Ti.API.info('setDistanceLabel, legNum: '+legNum);
	Ti.API.info('raceId: '+raceId);
	var dist = '';
	var diff = '';
	var up = '';
	var dn = '';

	var row = dbMain.execute('SELECT distance, rating_id, elev_gain, elev_loss FROM race_leg WHERE race_id = ? AND leg_number = ?',raceId,legNum);

	if (row.isValidRow()){
		dist = row.field(0);
		diff = row.field(1);
		up = row.field(2);
		dn = row.field(3);
	}
	row.close();
	Ti.API.info('distance: '+dist);

	var diffStr = getDifficulty(diff);
	if(target === targetEnum.TIMER){
		distanceLabel.text = dist + ' miles - ' + diffStr;
		elevChangeLabel.text = 'Elev. gain: '+up+' ft, loss: '+dn+' ft';
		predictedFinishLabel.text = 'Projected finish: '+getPredictedFinish(legNum,raceId); //TODO: refactor method to pass in distance and elevation gain/loss
	}else if(target === targetEnum.PREVIOUS){
		p_distanceLabel.text = dist + ' miles - ' + diffStr;
		p_elevChangeLabel.text = 'Elev. gain: '+up+' ft, loss: '+dn+' ft';
		p_predictedFinishLabel.text = 'Projected finish: '+getPredictedFinish(legNum,raceId); //TODO: refactor method to pass in distance and elevation gain/loss
	}else if(target === targetEnum.NEXT){
		n_distanceLabel.text = dist + ' miles - ' + diffStr;
		n_elevChangeLabel.text = 'Elev. gain: '+up+' ft, loss: '+dn+' ft';
		n_predictedFinishLabel.text = getPredictedFinish(legNum,raceId); //TODO: refactor method to pass in distance and elevation gain/loss
	}
}


function recordStartOfLeg(legNum,startTime){
	Ti.API.info('recordStartOfLeg: '+legNum);
	var currentTime;
	if (legNum == 1){ // this is the first leg so we get the current time (no need for it to match the end of leg time as we're setting it for the first time)
		var now = new Date();
		currentTime = now.getTime();
		legStartTime = currentTime;
		Titanium.App.Properties.setDouble('StartOfRelay',currentTime);
		dbMain.execute("UPDATE settings SET start_of_relay = ?,start_of_leg = ?,current_leg = 1 WHERE setting_id = 1",currentTime,currentTime);
		if(activeStatus == 1){
			setActualStartTimeOnServer(currentTime);
		}
		//setNetworkStatusForLeg(1,1); // start of race recorded
		currentLeg = 1; 
	} else {
		// need to update the displays
		legStartTime = startTime;
		currentTime = startTime;
		currentLeg = legNum;
		legLabel.text = 'Leg '+legNum;
		var setNum = getSetNumberForLegNum(currentLeg);
		Ti.API.info('recordstartofleg, setnum: '+setNum);
		Ti.API.info('recordStartOfLeg, currentTime: '+startTime);
		runnerLabel.text = getRunner(setNum);
		setDistanceLabel(currentLeg,targetEnum.TIMER);
		dbMain.execute("UPDATE settings SET start_of_leg = ?,current_leg = ? WHERE setting_id = 1",currentTime,legNum);
	}

	Titanium.App.Properties.setInt('CurrentLeg',currentLeg);
	Titanium.App.Properties.setDouble('StartOfLeg',currentTime);

	if(raceId > 0 && currentLeg > 0 && currentTime > 0){
		dbMain.execute("DELETE FROM relay_results WHERE race_id = ? AND leg_id = ?",raceId,currentLeg);
		dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start) VALUES (?,?,?)",raceId,currentLeg,currentTime);
	}
	//Ti.API.info("legNum: "+legNum);
	//Ti.API.info("activeStatus: "+activeStatus);
	//Ti.API.info("timeKeeper: "+timeKeeper);
	if((activeStatus == 1) && (timeKeeper == 1)){
		sendRaceProjections(teamPredictionKey,raceId,teamKey,handoffKey);
		//projectionTimer();
	}
};

var networkConnectionLabel = Ti.UI.createLabel({
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	color:'#fff',
	top:285,
	width:'auto',
	height:'auto'
});

win.add(networkConnectionLabel);
networkConnectionLabel.hide();

var updateLabel = Ti.UI.createLabel({
	text:'Updated: ',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	color:'#fff',
	top:305,
	width:'auto',
	height:'auto'
});

win.add(updateLabel);
updateLabel.hide(); 


var finalTimerLabel = Ti.UI.createLabel({
	text:'99:59:59',
	font:{fontSize:55,fontFamily:'Helvetica Neue'},
	color:'#fff',
	top:50,
	width:'auto',
	height:'auto'
});

win.add(finalTimerLabel);
finalTimerLabel.hide();


function recordEndOfLeg(raceId,legNum){
	setNetworkStatusForLeg(legNum,1);
	Ti.API.info('recordendofleg (leg number): '+legNum);
	var now = new Date();
	var currentTime = now.getTime();
	if(relayResultExists(legNum)){
		dbMain.execute("UPDATE relay_results SET leg_end = ? WHERE race_id = ? AND leg_id = ?",currentTime,raceId,legNum);
	}else{
		dbMain.execute("DELETE FROM relay_results WHERE race_id = ? AND leg_id = ?",raceId,legNum);
		dbMain.execute("INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES(?,?,?,?)",raceId,legNum,getFinishTimeForLeg(legNum-1),currentTime);
	}
	var ms = getLegElapsedTime(legNum,currentTime);
	if(legNum < 36){
		var newLegNum = legNum + 1;
		//Ti.API.info('new leg number: '+newLegNum);
		recordStartOfLeg(newLegNum,currentTime);
	}else if (legNum == 36){
		recordEndOfRace(currentTime);
	}

	//Ti.API.info('ready to send projections');
	//Ti.API.info('network status: '+Ti.Network.online);
	//Ti.API.info('tracking enabled: '+trackingEnabled);
	if((activeStatus == 1) && (timeKeeper == 1)){
		setServerStatusForLeg(legNum,currentTime);
		sendRaceProjections(teamPredictionKey,raceId,teamKey,handoffKey);
		clearInterval(synchStopWatch);
		checkForUnsentLegs(); 
		handleHeartbeat();
		synchronizationTimer();
	}
	return ms;
}

function recordEndOfRace(finalTime){
		raceIsOver = 1;
		clearInterval(stopWatch);
		clearInterval(listenerStopWatch);
		Titanium.App.Properties.setDouble('EndOfRelay',finalTime);
		Titanium.App.Properties.setInt('CurrentLeg',37);
		dbMain.execute("UPDATE settings SET current_leg = 37, end_of_relay = ?, ready_to_start = 0 WHERE setting_id = 1",finalTime);
		Ti.API.info('recorded end of race, finalTime: '+finalTime);
		Ti.API.info('recordEndofRace currentLeg: '+getCurrentLeg());
		showEndOfRaceDisplay(); 
};

function showEndOfRaceDisplay(){
	win.remove(timerLabel);
	win.remove(handoffButton);
	legLabel.text = 'Total Elapsed Time';
	runnerLabel.text = '';
	distanceLabel.text = '';
	elevChangeLabel.text = '';
	predictedFinishLabel.text = '';

	Ti.API.info('showEndOfRaceDisplay, getRaceTotalTime: '+getRaceTotalTime());
	finalTimerLabel.text = getRaceTotalTime();
	finalTimerLabel.show();
	raceOverLabel.show();	
	setPrevNextButtons();
};

function getLegElapsedTime(legNum,endTime){
	var startTime = Ti.App.Properties.getDouble('StartOfLeg');
	var ms = endTime - startTime;
	return ms;
}

Ti.include('get_displaytime.js');

var timerLabel = Ti.UI.createLabel({
	text:'00:00:00',
	font:{fontSize:55,fontFamily:'Helvetica Neue'},
	color:'#fff',
	//color:'#CCCCCC',
	top:50,
	width:'auto',
	height:'auto'
});

var noTimerLabel = Ti.UI.createLabel({
	//text:'The start time for this leg is not currently available.',
	text:'Missing Data for this Leg',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	color:'#fff',
	top:60,
	width:'auto',
	height:'auto',
	textAlign:'center'
});
win.add(noTimerLabel);
noTimerLabel.hide();

var legLabel = Ti.UI.createLabel({
	text:'Leg 1',
	font:{fontSize:30,fontFamily:'Helvetica Neue'},
	color:'#000',
	top:20,
	width:'auto',
	height:'auto'
});
win.add(legLabel);

var raceOverLabel = Ti.UI.createLabel({
	text:'See Reports for Final Results',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	color:terTextColor,
	top:165,
	width:'auto',
	height:'auto'	
});

win.add(raceOverLabel);
raceOverLabel.hide();

var runnerLabel = Ti.UI.createLabel({
	text:'Runner Name',
	font:{fontSize:30,fontFamily:'Helvetica Neue'},
	color:'#000',
	top:115,
	width:'auto',
	height:'auto'
});
win.add(runnerLabel);

var distanceLabel = Ti.UI.createLabel({
	text:'Placeholder for Distance',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	color:terTextColor,
	top:165,
	width:'auto',
	height:'auto'	
});
win.add(distanceLabel);

var elevChangeLabel = Ti.UI.createLabel({
	text:'Placeholder for Elevation',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	color:terTextColor,
	top:195,
	width:'auto',
	height:'auto'	
});
win.add(elevChangeLabel);

var predictedFinishLabel = Ti.UI.createLabel({
	text:'Placeholder for Predicted Finish',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	color:terTextColor,
	top:225,
	width:'auto',
	height:'auto'	
});
win.add(predictedFinishLabel);

var projectionLabel = Ti.UI.createLabel({
	text:'Projected finish: 45:18',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	color:terTextColor,
	top:225,
	width:'auto',
	height:'auto'	
});
//win.add(projectionLabel);


var a = Titanium.UI.createAlertDialog({
	title:'Caution!',
	message:'Do you want to enable the handoff button?',
	buttonNames: ['Yes','Not Yet']
});

a.addEventListener('click', function(e){
	if (e.index == 0){
		enabledForHandoff = true;
		if (currentLeg == 0 || currentLeg == -1){
			handoffButton.title = 'Start Race';
		} else if (currentLeg == 36){
			handoffButton.title = 'Record Finish';
		}else {
			handoffButton.title = 'Record Handoff';
		}
	} else {
		enabledForHandoff = false;
	}
});

var handoffButton = Ti.UI.createButton({
	top:290, 
	height:40,
	width: 225,
	title:'Prepare for Race Start'
});

handoffButton.addEventListener('click',function(e){
	// get the current leg number from the database
	var row = dbMain.execute('SELECT current_leg FROM settings WHERE setting_id = 1');
	if (row.isValidRow()){
		currentLeg = row.field(0);
	}
	row.close();
	var legNumber = currentLeg;
	Titanium.App.Properties.setInt('CurrentLeg',currentLeg);
	
	if (enabledForHandoff){
		//Ti.API.info('enabled for handoff, legNumber: '+legNumber);
		if (legNumber == null || legNumber == -1 || legNumber == 0){
			recordStartOfLeg(1,0); // record start of race
			display();
		} else if(legNumber < 36) {
			var ms = recordEndOfLeg(raceId,legNumber); // returns elapsed time in milliseconds
			display();
			//Ti.API.info('legNum: '+legNumber);
		} else if (legNumber == 36) {
			var ms = recordEndOfLeg(raceId,legNumber);
			raceIsOn = 0;
		} else {
			raceIsOn = 0; // the race is over
		}
		enabledForHandoff = false;
		handoffButton.title = 'Prepare for Handoff';

	} else { // popup alert so that the user can confirm that they are ready to handoff
		if (legNumber == -1 || legNumber == 0){
			a.message = 'Do you want to enable the race start button?';
		} else if (legNumber == 36) {
			a.message = 'Do you want to enable the record finish button?';
		} else {
			a.message = 'Do you want to enable the handoff button?';
		}
		a.show();
	}
	Ti.API.info('ready to call setPrevNextButtons, currentLeg: '+currentLeg);
	setPrevNextButtons();

});

function timerSetup(){
	var readyToStart = 0;
	try{
		//Ti.API.info('legstarttime before call to database: '+legStartTime);
		var row  = dbMain.execute('SELECT ready_to_start,race_id,current_leg,start_of_leg,start_of_relay,end_of_relay FROM settings WHERE setting_id = 1');
		if (row.isValidRow()){
			readyToStart = row.field(0);
			raceId = row.field(1);
			currentLeg = row.field(2);
			legStartTime = row.field(3);
			Ti.API.info('it got here: 6a');
			raceStartTime = row.field(4);
			raceEndTime = row.field(5);
			Ti.API.info('timerSetup readyToStart: '+readyToStart);
			Ti.API.info('raceId: '+raceId);
			Ti.API.info('legStartTime from database: '+legStartTime);
			Ti.API.info('currentLeg from database: '+currentLeg);
			Ti.API.info('race start time from database: '+raceStartTime);
			Ti.API.info('race end time from database: '+raceEndTime);
		}
		row.close();
		var rowDS = dbMain.execute('SELECT active, listen, timekeeper FROM handoff_status WHERE handoff_id = 1');
		if(rowDS.isValidRow()){
			activeStatus = rowDS.field(0); // this flag indicates whether data sharing has been turned on
			listenerStatus = rowDS.field(1);
			timeKeeper = rowDS.field(2);
		}
		rowDS.close();
	}catch(ex){
		Ti.API.info('timerSetup exception: '+ex);
	}
	//('readyToStart: '+readyToStart);
	//Ti.API.info('raceId: '+raceId);
	//Ti.API.info('currentLeg: '+currentLeg);
	if (readyToStart == 1){
		runnerLabel.color = '#000'; // black
		if (currentLeg == 0 || currentLeg == -1){
			// set runner display label for first runner
			//Ti.API.info('it should get here: 1');
			
			legLabel.text = 'Leg 1';
			handoffButton.title = 'Prepare for Race Start';
			timerLabel.text = '00:00:00';
			
			var rn = getRunner(1); // pass in the set id
			runnerLabel.text = rn;
			setDistanceLabel(1,targetEnum.TIMER);
			Titanium.App.Properties.setInt('CurrentLeg',-1);
			raceOverLabel.hide();
			finalTimerLabel.hide();
		} else {
			Ti.API.info('it should hit here if the race is going on, currentLeg: '+currentLeg);
			// get the set number for the current leg
			var setNum = 0;
			var row = dbMain.execute('SELECT set_number FROM race_leg WHERE leg_number = ? AND race_id = ?',currentLeg,raceId);
			if(row.isValidRow()){
				setNum = row.field(0);
			}
			row.close();
			handoffButton.title = 'Prepare for Handoff';
			var rn = getRunner(setNum);
			runnerLabel.text = rn;
			setDistanceLabel(currentLeg,targetEnum.TIMER);
			legLabel.text = 'Leg '+currentLeg;
			// start timer display
			display();
		}
	} else {
		if(raceEndTime === 0){
			runnerLabel.text = 'Setup Not Complete';
			runnerLabel.color = 'red';
			distanceLabel.text = 'Please return to the setup tab.';
			elevChangeLabel.text = '';
			predictedFinishLabel.text = '';
		}else{
			showEndOfRaceDisplay();
		}
	}
	win.add(timerLabel);
	if((listenerStatus == 0) && (timeKeeper == 1)){
		win.add(handoffButton);
		handoffButton.show();
		networkConnectionLabel.hide();
		updateLabel.hide();
		clearInterval(listenerStopWatch);
	}
}

function setPrevNextButtons(){
	if(currentLeg > 1){
		win.setLeftNavButton(prevBtn);
	} else {
		win.setLeftNavButton(null);
	}
	
	if(currentLeg < 36){
		win.setRightNavButton(nextBtn);
	}else{
		win.setRightNavButton(null);
	}
};


win.addEventListener('focus',function(e){
	Ti.API.info("timer focus event fired");
	//dbMain = Titanium.Database.open('main');
	dbMain = Titanium.Database.open('main');
	var rowCL = dbMain.execute('SELECT current_leg,end_of_relay,race_id,start_of_leg FROM settings WHERE setting_id = 1');
	if (rowCL.isValidRow()){
		currentLeg = rowCL.field(0);
		endOfRelay = rowCL.field(1);
		raceId = rowCL.field(2);
		legStartTime = rowCL.field(3);
	}
	rowCL.close();	
	setPrevNextButtons();
	Ti.API.info('focus event, current leg: '+currentLeg);

	if(endOfRelay > 0){
		if(currentLeg !== 37){
			dbMain.execute('UPDATE settings SET current_leg = 37 WHERE setting_id = 1');
		}
		showEndOfRaceDisplay();
	} else {
		row = dbMain.execute("SELECT team_prediction_key, tracking_enabled, team_key FROM team_identity WHERE team_id = 1");
		Ti.API.info('executed query for focus event');
		if(row.isValidRow()){
			teamPredictionKey = row.field(0);
			Ti.API.info('tpk: '+teamPredictionKey);
			trackingEnabled = row.field(1);
			Ti.API.info('te: '+trackingEnabled);
			teamKey = row.field(2);
			Ti.API.info('teamKey: '+teamKey);
		}
		row.close();
		var handoffStatus = dbMain.execute("SELECT active,handoff_key,timekeeper,listen FROM handoff_status WHERE handoff_id = 1");
		if(handoffStatus.isValidRow()){
			activeStatus = handoffStatus.field(0);
			handoffKey = handoffStatus.field(1);
			timeKeeper = handoffStatus.field(2);
			listenerStatus = handoffStatus.field(3);
		}
		handoffStatus.close();
		Ti.API.info("active: "+activeStatus);
		Ti.API.info("hok: "+handoffKey);
		Ti.API.info("tks: "+timeKeeper);
		Ti.API.info("ls: "+listenerStatus);
		if((activeStatus == 1) && (timeKeeper == 0)){
			handoffButton.hide();
		}
		if((activeStatus == 1) && (timeKeeper == 1)){
			handoffButton.show();
			networkConnectionLabel.hide();
			updateLabel.hide();
			dbMain.execute("UPDATE handoff_status SET listen = 0 WHERE handoff_id = 1");
			clearInterval(listenerStopWatch);
			
			// this ensures that the server always has the latest projections 
			//sendRaceProjections(teamPredictionKey,raceId,teamKey,handoffKey);
			//projectionTimer();
			//synchronizationTimer();
		}
		if(activeStatus == 1){
			checkForUnsentLegs();
			synchronizationTimer();
		}
		
		if((activeStatus == 1) && (listenerStatus == 1)){
			handoffButton.hide();
			if(Ti.Network.online == 1){
				networkConnectionLabel.text = 'Network status: connected '+getTime();
				checkForUpdate();
			}else{
				networkConnectionLabel.text = 'Network status: not connected';
			}
			networkConnectionLabel.show();
			updateLabel.text = '';
			updateLabel.show();
			dbMain.execute("UPDATE handoff_status SET timekeeper = 0 WHERE handoff_id = 1");
			clearInterval(listenerStopWatch);
			
			//checkForUpdate();
			listenerTimer();
		}
		
		timerSetup();
	}
});

win.addEventListener('blur',function(e){
	Ti.API.info('timer blur event called, raceIsOver: '+raceIsOver);
	Titanium.App.Properties.setDouble('StartOfLeg',legStartTime);
	raceIsOver = (getCurrentLeg() == 37) ? 1 : 0;
	if (raceIsOver == 1){
		try{
			finalTimerLabel.hide();
			showEndOfRaceDisplay();
		}catch(ex){
			Ti.API.info('finalTimeLabel not present');
		}

	}
});


win.addEventListener('open',function(e){
	Ti.API.info('timer open event fired');
});

