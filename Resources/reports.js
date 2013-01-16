var win = Titanium.UI.currentWindow;
var dbMain;
var raceId;
var webview;
var htmlStr;

var reportTypeEnum = {
	SHORT: 0,
	EXTENDED: 1
};

win.barColor = 'black';

var reportData = [];

win.backgroundImage = 'gradientBackground.png';

Ti.include('get_displaytime.js');
Ti.include('biz_logic.js');

var raceId = getRaceId();

var bgColor = '#FFF';
if (Titanium.Platform.name == 'iPhone OS')
{
	win.backgroundImage = 'gradientBackground.png';
} else {
	bgColor = '#000';
}

function getReportWarning(){
	htmlStr = '<html><body><h3>Setup Not Complete</h3>';
	htmlStr += 'The reports cannot be accessed until setup is complete. Please return to the Setup tab and make sure all items are complete. Then click on the Finalize Leg Assignments Button. <p>Note: The results report is not available until ';
	htmlStr += 'the race is underway. ';
	htmlStr += '</table></body></html>';
	return htmlStr;
}

function sunMoonReport(){
	var sunrise = '';
	var sunset = '';
	var moonrise = '';
	var moonset = '';
	var moon_illum = 0;
	//Ti.API.info('raceId: '+raceId);
	var mData = dbMain.execute('SELECT sunrise,sunset,moonrise,moonset,moon_illum FROM race WHERE race_id = ?',raceId);
	if(mData.isValidRow()){
		sunrise = mData.field(0);
		sunset = mData.field(1);
		moonrise = mData.field(2);
		moonset = mData.field(3);
		moon_illum = mData.field(4);
	}
	//Ti.API.info('moon_illum: '+moon_illum);
	mData.close();
	sunrise = (sunrise == null) ? '' : sunrise;
	sunset = (sunset == null) ? '' :sunset;
	moonrise = (moonrise == null ) ? '' :moonrise;
	moonset = (moonset == null) ? '' :moonset;
	
	htmlStr = '<html><head><style type="text/css">';
	if(moon_illum > 95){
		htmlStr += 'body{background-image:url("moon100.gif");';	
	}else if(moon_illum > 90){
		htmlStr += 'body{background-image:url("moon95.gif");';	
	}else if(moon_illum > 83){
		htmlStr += 'body{background-image:url("moon90.gif");';	
	}else if(moon_illum > 65){
		htmlStr += 'body{background-image:url("moon65.gif");';	
	}else if(moon_illum > 50){
		htmlStr += 'body{background-image:url("moon50.gif");';	
	}else if(moon_illum > 40){
		htmlStr += 'body{background-image:url("moon42.gif");';	
	}else if(moon_illum > 30){
		htmlStr += 'body{background-image:url("moon30.gif");';	
	}else if(moon_illum > 20){
		htmlStr += 'body{background-image:url("moon20.gif");';	
	}else if(moon_illum > 10){
		htmlStr += 'body{background-image:url("moon12.gif");';	
	}else if(moon_illum > 05){
		htmlStr += 'body{background-image:url("moon07.gif");';	
	}else if(moon_illum > 0){
		htmlStr += 'body{background-image:url("moon04.gif");';	
	} else {
		htmlStr += 'body{background-image:url("moon100.gif");';	
	}
		
	htmlStr += 'background-repeat:no-repeat;background-size:90% 100%;background-position:center}';
	htmlStr += '.rname{color:#FFFF66;font:17px arial,sans-serif;font-weight:bold}';
	htmlStr += '.rvalue{color:#00FF66;font:17px arial,sans-serif;font-weight:bold}';
	htmlStr += '</style></head><body bgcolor="black">';
	//htmlStr += '<table style="width:320px;height:400px;">';
	htmlStr += '<table width="100%">';
	htmlStr += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
	htmlStr += '<tr><td>&nbsp;&nbsp;</td><td width="44%"><span class="rname">Sunset</span></td><td><span class="rvalue">'+sunset+'</span></td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td><span class="rname">Moonrise</span></td><td><span class="rvalue">'+moonrise+'</span></td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td><span class="rname">Moonset</span></td><td><span class="rvalue">'+moonset+'</span></td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td><span class="rname">Moon Illumin</span></td><td><span class="rvalue">'+moon_illum+' percent</span></td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td><span class="rname">Sunrise</span></td><td><span class="rvalue">'+sunrise+'</span></td></tr>';
	htmlStr += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
	htmlStr += '</table>';
	htmlStr += '</body></html>';
	return htmlStr;
};

function getRunnerSummary(reportType){
	var raceId = getRaceId();
	
	htmlStr = '<html><body><table border=1 cellpadding=2>';	
	var summaryRow = dbMain.execute("SELECT r.first_name,r.last_name,r.set_id,l.leg_number,l.distance,l.rating_id,l.elev_gain,l.elev_loss FROM runner r, race_leg l WHERE r.set_id = l.set_number AND l.race_id = ? ORDER BY r.set_id,l.leg_number",raceId);
	var rowCounter = 1;
	var totDist = 0;
	var totProjTime = 0;
	var totActualTime = 0;
	var totActualDistance = 0;
	var totElevGain = 0;
	var totElevLoss = 0;
	while(summaryRow.isValidRow()){
		var fn = summaryRow.field(0);
		var ln = summaryRow.field(1);
		var si = summaryRow.field(2);
		var lg = summaryRow.field(3);
		var ds = summaryRow.field(4);
		totDist += ds;
		var ri = summaryRow.field(5);
		var eg = summaryRow.field(6);
		var el = summaryRow.field(7);
		totElevGain += eg;
		totElevLoss += el;
		var projectedTime = getPredictedFinish(lg,raceId);
		totProjTime += getProjectedRunnerTime(lg,raceId);
		var actualTime = getActualTime(lg,raceId);
		totActualTime += actualTime;
		if(actualTime > 0){
			totActualDistance += ds;
		}
		
		if(rowCounter == 1){
			if(reportType === reportTypeEnum.SHORT){
				htmlStr += '<tr><td align="right" bgcolor="#FFFF66"><b>'+si+'</b></td><td colspan=5 bgcolor="#FFFF66"><b>'+fn+' '+ln+'</b></td></tr>';
				htmlStr += '<tr bgcolor="#FFFFCC"><th>Leg</th><th>Rtg</th><th>&nbsp;Dist&nbsp;</th><th>Proj</th><th>Act</th><th>Pace</th></tr>';
				htmlStr += '<tr><td align="right">'+lg+'</td><td>'+getDifficultyAbbrv(ri)+'</td><td align="right">'+ds+'</td><td>'+projectedTime+'</td><td>'+getActualDisplayTime(lg,raceId)+'</td><td align="right">'+getPaceDisplay(actualTime,ds)+'</tr>';	
			}else{ // extended report
				htmlStr += '<tr><td align="right" bgcolor="#FFFF66"><b>'+si+'</b></td><td colspan=7 bgcolor="#FFFF66"><b>'+fn+' '+ln+'</b></td></tr>';
				htmlStr += '<tr bgcolor="#FFFFCC"><th>Leg</th><th>Rating</th><th>&nbsp;Distance&nbsp;</th><th>Elev Gain</th><th>Elev Loss</th><th>Projected</th><th>Actual</th><th>Pace</th></tr>';
				htmlStr += '<tr><td align="right">'+lg+'</td><td>'+getDifficulty(ri)+'</td><td align="right">'+ds+'</td><td align="right">'+eg+'</td><td align="right">'+el+'</td><td>'+projectedTime+'</td><td>'+getActualDisplayTime(lg,raceId)+'</td><td align="right">'+getPaceDisplay(actualTime,ds)+'</tr>';	
			}
		}else{
			if(reportType === reportTypeEnum.SHORT){
				htmlStr += '<tr><td align="right">'+lg+'</td><td>'+getDifficultyAbbrv(ri)+'</td><td align="right">'+ds+'</td><td>'+projectedTime+'</td><td>'+getActualDisplayTime(lg,raceId)+'</td><td align="right">'+getPaceDisplay(actualTime,ds)+'</td></tr>'; 
			}else{
				htmlStr += '<tr><td align="right">'+lg+'</td><td>'+getDifficulty(ri)+'</td><td align="right">'+ds+'</td><td align="right">'+eg+'</td><td align="right">'+el+'</td><td>'+projectedTime+'</td><td>'+getActualDisplayTime(lg,raceId)+'</td><td align="right">'+getPaceDisplay(actualTime,ds)+'</tr>';	
			}
		}

		if(rowCounter > 2){
			// SUMMARY ROW
			var totProjTimeStr = getDisplayTime(totProjTime);
			var totActualTimeStr = getDisplayTime(totActualTime);
			var totDistStr = roundNumber(totDist,1);
			if(reportType === reportTypeEnum.SHORT){
				htmlStr += '<tr bgcolor="#99FF99"><td colspan=2>&nbsp;</td><td align="right">'+totDistStr+'</td><td>'+totProjTimeStr+'</td><td>'+totActualTimeStr+'</td><td align="right">'+getPaceDisplay(totActualTime,totActualDistance)+'</td></tr>';
			}else{
				htmlStr += '<tr bgcolor="#99FF99"><td colspan=2>&nbsp;</td><td align="right">'+totDistStr+'</td><td align="right">'+totElevGain+'</td><td align="right">'+totElevLoss+'</td><td>'+totProjTimeStr+'</td><td>'+totActualTimeStr+'</td><td align="right">'+getPaceDisplay(totActualTime,totActualDistance)+'</td></tr>';
			}
			rowCounter = 1;
			totDist = 0;
			totProjTime = 0;
			totActualTime = 0;
			totActualDistance = 0;
			totElevGain = 0;
			totElevLoss = 0;
		}else{
			rowCounter++;
		}
		summaryRow.next();
	}
	summaryRow.close();
	htmlStr += '</table></body></html>';
	return htmlStr;
}

function getProjectedTimesReport(){
	Ti.include('projections.js');
	var projArray = getProjections();
	htmlStr = '<html><body><table cellspacing="2"><tr><th>Leg</th><th align="left">Description</th><th>Start</th><th>Finish</th></tr>';
	
	rotationCounter = 0;
	rowCounter = 0;
	
	for(var i=0; i < projArray.length; i++){
		rowCounter++;
		dispObj = projArray[i];
		dispState = 'Projected';
		lt = dispObj.state; // A = actual, P = projected
		dispState = (lt == 'A') ? 'Actual' : 'Projected';
		ln = dispObj.legNum;
		ls = dispObj.legStart;
		le = dispObj.legEnd;
		
		htmlStr += '<tr><td>'+ln+'</td><td>'+dispState+'</td><td width="32%" align="right">'+getFormattedTime(ls)+'</td><td width="32%" align="right">'+getFormattedTime(le)+'</td></tr>';
		rotationCounter++;
		
		if(rotationCounter == 6){
			if(rowCounter == 36){
				htmlStr += '<tr><td colspan="4" bgcolor="#CCFFFF" align="center">Finish</td></tr>';
			} else {
				htmlStr += '<tr><td colspan="4" bgcolor="#99FFCC" align="center">Major Exchange</td></tr>';
			}
			rotationCounter = 0;
		}
	}
	
	htmlStr += '</table></body></html>';
	return htmlStr;

}


function getLegReport(reportType){
	var htmlStr = '';
	var currentLeg = -1; 
	try{
		currentLeg = getCurrentLeg();
		var rid = getRaceId();
	
		dbMain.execute("DELETE FROM relay_results WHERE race_id <> ?",rid);
		relayResultCleanup();
		
		if(reportType === reportTypeEnum.SHORT){
			htmlStr = '<html><body><table cellspacing="2"><tr><th>#</th><th align="left">Runner</th><th>Dist</th><th>Proj</th><th>Actual</th><th>Pace</th></tr>';
		}else{
			htmlStr = '<html><body><table cellspacing="2"><tr><th>Leg</th><th align="left">Runner</th><th>Distance</th><th>Rating</th><th>Elev Loss</th><th>Elev Gain</th><th>Projected</th><th>Actual</th><th>Pace</th></tr>';
		}
		//var rows = dbMain.execute('SELECT r.leg_id, r.leg_start, r.leg_end FROM relay_results r WHERE r.race_id = ? ORDER BY r.leg_id',raceId);
		var rows = dbMain.execute('SELECT l.leg_number, r.leg_start, r.leg_end, l.distance,l.set_number,l.rating_id,l.elev_gain,l.elev_loss,l.start_lat,l.start_lon FROM relay_results r, race_leg l WHERE r.leg_id = l.leg_number AND l.race_id = ? ORDER BY r.leg_id',rid);
		//Ti.API.info('rowCount for getLegReport query: '+rows.getRowCount());	
		var counter = 0;
		while(rows.isValidRow()){
			var displayTime;
			var pace;
			var legId = rows.field(0); // this is actually the leg number
			var start = rows.field(1);
			var end = rows.field(2);
			//Ti.API.info('legId: '+legId+' currentLeg: '+currentLeg);
			if((end == 0) && (legId < currentLeg)){
				end = getStartTimeForLeg(legId+1);				
			}
			Ti.API.info('leg: '+legId+' start: '+start+' end: '+end);
			var dist = rows.field(3);
			var setNum = rows.field(4);
			var rating = rows.field(5);
			var elevGain = rows.field(6);
			var elevLoss = rows.field(7);
			var startLat = rows.field(8);
			//Ti.API.info('startLat: '+startLat);
			var startLon = rows.field(9);
			//Ti.API.info('startLon: '+startLon);
			var diff = getDifficultyAbbrv(rating);
			var projectedTime = getPredictedFinish(legId,rid);
			var fn = getRunnerFirstName(setNum);
			var ln = getRunnerLastInitial(setNum);
			fn = (ln.length > 0) ? fn + ' ' + ln + '.' : fn;
/*			if(legId == 1){
				Ti.API.info('start of race from relay_results: '+start);
				Ti.API.info('actual start of relay: '+getActualStartOfRelay());
			}
*/
			if ((end != null) && (end !== 0) && (start != null) && (start !== 0) && (end > start)){
				//Ti.API.info("it made it here: 1e");
				displayTime = getDisplayTime(end-start);
				pace = getPace(dist,end-start);
				if(reportType === reportTypeEnum.SHORT){
					if((startLat !== "1") && (startLat !== "-1")){
						legId = '<a href="https://maps.google.com/maps?q='+startLat+','+startLon+'&hl=en&t=h&z=16">'+legId+'</a>';
					}
					htmlStr += '<tr><td align="right">' + legId + '</td><td width="38%">'+fn+'</td><td>' + dist + '</td><td bgcolor="#99FFCC">'+projectedTime+'</td><td bgcolor="#CCFFFF">' + displayTime + '</td><td width="17%" align="right" bgcolor="#99FFCC">'+pace+'</td></tr>';
				}else{
					htmlStr += '<tr><td align="right" width="7%">' + legId + '</td><td>'+fn+'</td><td align="right" width="8%">' + dist + '</td><td align="right" width="6%">' + diff +'</td><td align="right" width="8%">' + elevLoss + '</td><td align="right" width="8%">' + elevGain +'</td><td bgcolor="#99FFCC" width="15%" align="right">'+projectedTime+'</td><td bgcolor="#CCFFFF" width="15%" align="right">' + displayTime + '</td><td width="15%" align="right" bgcolor="#99FFCC">'+pace+'</td></tr>';
				}
			} else {
/*				var lid = 0;
				Ti.API.info("legId: "+legId);
				Ti.API.info("legId type: "+(legId instanceof String));
				lid = Number(legId);
				Ti.API.info("lid: "+lid);
				//var lid = Number(legId.toString().trim());
				var cl = Number(currentLeg);
				Ti.API.info('legId(lid): '+lid+' currentLeg(cl): '+cl);
				Ti.API.info("it made it here: 2a: "+(lid > cl));
				Ti.API.info("it made it here: 2b: "+(lid < cl));
				Ti.API.info("it made it here: 2c: "+(lid == cl));
				Ti.API.info("it made it here: 2d: "+(lid === cl));
*/
				Ti.API.info('currentLeg: '+currentLeg+' legId: '+legId);
				if(currentLeg > legId){
					if(reportType === reportTypeEnum.SHORT){
						if((startLat !== "1") && (startLat !== "-1")){
							legId = '<a href="https://maps.google.com/maps?q='+startLat+','+startLon+'&hl=en&t=h&z=16">'+legId+'</a>';
						}
						htmlStr += '<tr><td align="right">' + legId + '</td><td width="38%">'+fn+'</td><td>' + dist + '</td><td colspan="3" align="center">*** missing data ***</td></tr>';
					}else{
						htmlStr += '<tr><td align="right">' + legId + '</td><td>'+fn+'</td><td align="right">' + dist + '</td><td align="right">' + diff +'</td><td align="right">' + elevLoss +'</td><td align="right">' + 
						elevGain + "</td><td colspan=\"3\" align=\"center\">*** missing data ***</td></tr>";
					}
				} else if(currentLeg === legId){
					Ti.API.info('ISGH: 1a');
					if(reportType === reportTypeEnum.SHORT){
						if((startLat !== "1") && (startLat !== "-1")){
							legId = '<a href="https://maps.google.com/maps?q='+startLat+','+startLon+'&hl=en&t=h&z=16">'+legId+'</a>';
						}
						htmlStr += '<tr><td align="right">' + legId + '</td><td width="38%">'+fn+'</td><td>' + dist + "</td><td colspan=\"3\" align=\"center\">*** current leg ***</td></tr>";
					}else{
						htmlStr += '<tr><td align="right">' + legId + '</td><td>'+fn+'</td><td align="right">' + dist + '</td><td align="right">' + diff +'</td><td align="right">' + elevLoss +'</td><td align="right">' + 
						elevGain + "</td><td colspan=\"3\" align=\"center\">*** current leg ***</td></tr>";
					}
				}
			}
			counter++;
			rows.next();
		}
		rows.close();
		if(counter == 36){
			var totalTime = getRaceTotalTime();
			if(reportType === reportTypeEnum.SHORT){
				htmlStr += '<tr></tr><tr><td colspan="5">Race Total: '+totalTime+'</td></tr>';
			}else{
				htmlStr += '<tr></tr><tr><td colspan="8">Race Total: '+totalTime+'</td></tr>';
			}
		}
		htmlStr += '</table></body></html>';
	}catch(e){
		htmlStr = '<html><body><h2>Report Error</h2>Try back later.<br>'+e+'</body></html>';
	}
	return htmlStr;
}

function getLegOverview(){
	raceId = getRaceId();
	htmlStr = '<html><body><table cellspacing="2"><tr><th>Leg</th><th align="left">Runner</th><th>Dist</th><th>Rating</th><th>Gain</th><th>Loss</th></tr>';
	var rows = dbMain.execute('SELECT leg_number,distance,rating_id,elev_gain,elev_loss,set_number,start_lat,start_lon FROM race_leg WHERE race_id = ? ORDER BY leg_number',raceId);
	while(rows.isValidRow()){
		var legNum = rows.field(0);
		var dist = rows.field(1);
		var rating = rows.field(2);
		var diff = getDifficultyAbbrv(rating);
		var gain = rows.field(3);
		var loss = rows.field(4);
		var setNum = rows.field(5);
		var startLat = rows.field(6);
		var startLon = rows.field(7);
		var fn = getRunnerFirstName(setNum);
		var ln = getRunnerLastInitial(setNum);
		fn = (ln.length > 0) ? fn + ' ' + ln + '.' : fn;
		if((startLat !== "1") && (startLat !== "-1")){
			legNum = '<a href="https://maps.google.com/maps?q='+startLat+','+startLon+'&hl=en&t=h&z=16">'+legNum+'</a>';
		}

		htmlStr += '<tr><td align="right">' + legNum + '</td><td width="45%">'+fn+'</td><td>' + dist + '</td><td bgcolor="#CCFFFF" align="center">' + diff + '</td><td width="15%" align="right">'+gain+'</td><td width="15%" align="right">'+loss+'</td></tr>';
		rows.next();
	}
	rows.close();
	htmlStr += '</table></body></html>';
	return htmlStr;	
}

function emailResultReport(){
	var raceName;
	var raceDate;
	var qRow = dbMain.execute('SELECT race_name,race_date FROM race WHERE race_id = ?',raceId);
	if (qRow.isValidRow()){
		raceName = qRow.field(0);
		raceDate = qRow.field(1);
	}
	qRow.close();
	
	var reportContents = getLegReport(reportTypeEnum.EXTENDED);
	var fileName = 'relay_results.html';
	var myFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,fileName);
	myFile.write(reportContents);
	
	var emailDialog02 = Titanium.UI.createEmailDialog();
	if (!emailDialog02.isSupported()) {
		Ti.UI.createAlertDialog({
			title:'Error',
			message:'Email not available'
		}).show();
		return;
	}
	emailDialog02.setSubject('Relay Results');
	emailDialog02.messageBody = 'The attached report contains the leg results from the '+raceName+' relay which was run on '+raceDate+'.';
	//var f = Ti.Filesystem.getFile(fileName);
	emailDialog02.addAttachment(myFile);
	//emailDialog02.setToRecipients(['support@sinequanonsolutions.com']);
	emailDialog02.addEventListener('complete',function(e)
	{
		if (e.result == emailDialog02.SENT)
		{
			if (Ti.Platform.osname != 'android') {
				// android doesn't give us useful result codes.
				alert("Your message has been sent.");
			}
		}
		else
		{
			alert("Your message was not sent.");
		}
	});
	emailDialog02.open();


};

function emailSummaryReport(){
	var raceName;
	var raceDate;
	var qRow = dbMain.execute('SELECT race_name,race_date FROM race WHERE race_id = ?',raceId);
	if (qRow.isValidRow()){
		raceName = qRow.field(0);
		raceDate = qRow.field(1);
	}
	qRow.close();
	
	var reportContents = getRunnerSummary(reportTypeEnum.EXTENDED);
	var fileName = 'summary_results.html';
	var myFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,fileName);
	myFile.write(reportContents);
	
	var emailDialog02 = Titanium.UI.createEmailDialog();
	if (!emailDialog02.isSupported()) {
		Ti.UI.createAlertDialog({
			title:'Error',
			message:'Email not available'
		}).show();
		return;
	}
	emailDialog02.setSubject('Runner Summary Report');
	emailDialog02.messageBody = 'The attached report contains the summary runner results from the '+raceName+' relay which was run on '+raceDate+'.';
	//var f = Ti.Filesystem.getFile(fileName);
	emailDialog02.addAttachment(myFile);
	//emailDialog02.setToRecipients(['support@sinequanonsolutions.com']);
	emailDialog02.addEventListener('complete',function(e)
	{
		if (e.result == emailDialog02.SENT)
		{
			if (Ti.Platform.osname != 'android') {
				// android doesn't give us useful result codes.
				alert("Your message has been sent.");
			}
		}
		else
		{
			alert("Your message was not sent.");
		}
	});
	emailDialog02.open();
};



function getRunnerOrder(){
	htmlStr = '<html><body><table><tr><th>Set</th><th align="left">Name</th><th>Pace</th><th>Mileage</th></tr>';
	var rows = dbMain.execute('SELECT first_name, last_name, ten_k_speed, miles_per_week, set_id FROM runner ORDER BY set_id');
	while(rows.isValidRow()){
		var fn = rows.field(0);
		var ln = rows.field(1);
		var speed = rows.field(2);
		var dist = roundNumber(rows.field(3),1);
		var setnum = rows.field(4);
		fn = (ln == null) ? fn : fn + ' ' + ln;
		var pace = speedToPace(speed);
		dist = (dist == null) ? 'n/a' : dist;
		htmlStr += '<tr><td align="right">' + setnum + '</td><td width="63%">' + fn + '</td><td align="right">' + pace + '</td><td align="right">' + dist + '</td></tr>';
		rows.next();
	}
	rows.close();
	htmlStr += '</table></body></html>';
	return htmlStr;	
	
}

var header = Ti.UI.createView({
	height:20
});

var headerLabel = Ti.UI.createLabel({
	font:{fontFamily:'Helvetica Neue',fontSize:18,fontWeight:'bold'},
	text:'Custom Header',
	color:'#191',
	textAlign:'left',
	left:10,
	width:'auto',
	height:'auto'
});

//header.add(headerLabel);


var reloadBtn = Ti.UI.createButton({
	title:'Refresh'
});

reloadBtn.addEventListener('click',function(e){
	//Ti.API.info('it hit the reload function');
	//webview.reload();
	getLegReport(reportTypeEnum.SHORT);
});

var backBtn = Titanium.UI.createButton({
	title:'Reports'
});

backBtn.addEventListener('click',function(e){
	//Ti.API.info('hit back button');
	win.remove(webview);
	win.title = 'Reports';
	win.leftNavButton = null;
});

//section.headerView = header;

reportData[0] = Ti.UI.createTableViewSection();
reportData[0].add(Ti.UI.createTableViewRow({title:'Leg Overview', hasChild:true, backgroundColor:bgColor}));
reportData[0].add(Ti.UI.createTableViewRow({title:'Leg Start & Finish Times', hasChild:true, backgroundColor:bgColor}));
reportData[0].add(Ti.UI.createTableViewRow({title:'Runner Order', hasChild:true, backgroundColor:bgColor}));
reportData[0].add(Ti.UI.createTableViewRow({title:'Sunset/Moonrise Report',hasChild:true, backgroundColor:bgColor}));

reportData[1] = Ti.UI.createTableViewSection();
reportData[1].add(Ti.UI.createTableViewRow({title:'Leg Results', hasChild:true, backgroundColor:bgColor}));
reportData[1].add(Ti.UI.createTableViewRow({title:'Email Leg Results', hasChild:true, backgroundColor:bgColor}));
reportData[1].add(Ti.UI.createTableViewRow({title:'Runner Summary Report',hasChild:true, backgroundColor:bgColor}));
reportData[1].add(Ti.UI.createTableViewRow({title:'Email Summary Report',hasChild:true, backgroundColor:bgColor}));

//create table view
var tableviewReport = Titanium.UI.createTableView({
	data:reportData,
	style:Titanium.UI.iPhone.TableViewStyle.GROUPED
});

//create table view event listener
tableviewReport.addEventListener('click', function(e)
{
	
	dbMain = Titanium.Database.open('main');
	var ready = 0;
	var row = dbMain.execute('SELECT ready_to_start FROM settings WHERE setting_id = 1');
	if (row.isValidRow()){
		ready = row.field(0);
	}
	row.close();
	
	webview = Ti.UI.createWebView();
	if (ready == 99){
		win.title = '';
		webview.html = getReportWarning();
	} else {
		//Ti.API.info('Hit tableviewReport event listener');
		//Ti.API.info(e);
		
		switch(e.index){
		case 0:
			win.title = 'Leg Overview';
			webview.html = getLegOverview();
			break;
		case 1:
			win.title = 'Leg Start & Finish';
			webview.html = getProjectedTimesReport();
			break;
		case 2:
			win.title = 'Runner Order';
			webview.html = getRunnerOrder();
			break;
		case 3:
			win.title = 'Sun/Moon Report';
			webview.html = sunMoonReport();
			break;
		case 4:
			win.title = 'Leg Results';
			webview.html = getLegReport(reportTypeEnum.SHORT);
			break;
		case 5:
			emailResultReport();
			break;
		case 6:
			win.title = 'Runner Summary';
			webview.html = getRunnerSummary(reportTypeEnum.SHORT);
			break;
		case 7:
			emailSummaryReport();
			break;
		}
	}
	win.leftNavButton = backBtn;
	//win.rightNavButton = reloadBtn;
	//win.setLeftNavButton(backBtn);
	win.add(webview);

});

win.addEventListener('focus', function(e){
	dbMain = Titanium.Database.open('main');
});

win.add(tableviewReport);
