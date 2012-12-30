var win = Titanium.UI.currentWindow;
var newStartTime;
var dbMain;
var raceId = -1;
var teamName = "";
var teamNumber = "";
var relayResultCount = 0;
var currentLeg = 1;
var startOfCurrentLeg = 0;
var maxLeg = 0;
var timekeeperFlag = 1; // set to 0 if handoff status is active and listener flag = 1

win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';
win.hideTabBar();
win.title = 'Edit Time';
Ti.include('get_displaytime.js');

var tfHours = Titanium.UI.createTextField({
	color:'#336699',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	height:35,
	top:50,
	left:77,
	width:36,
	value:9,
	//hintText:'HH',
	keyboardType:Titanium.UI.NUMBER_PAD,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

tfHours.addEventListener('focus',function(e){
	tfHours.value = null;
});

var tfMinutes = Titanium.UI.createTextField({
	color:'#336699',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	height:35,
	top:50,
	left:133,
	width:53,
	value:59,
	//hintText:'MM',
	keyboardType:Titanium.UI.NUMBER_PAD,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

tfMinutes.addEventListener('focus',function(e){
	tfMinutes.value = null;
});

var tfSeconds = Titanium.UI.createTextField({
	color:'#336699',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	height:35,
	top:50,
	left:202,
	width:53,
	value:59,
	//hintText:'SS',
	keyboardType:Titanium.UI.NUMBER_PAD,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

tfSeconds.addEventListener('focus',function(e){
	tfSeconds.value = null;
});

var saveBtn = Titanium.UI.createButton({
	title:'Save'
});

win.setRightNavButton(saveBtn);

win.add(tfHours);
win.add(tfMinutes);
win.add(tfSeconds);

var timesLabel = Ti.UI.createLabel({
	text:'Start time: 12:45:01 pm - End time: 1:35:43 pm',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	height:12,
	color:'#fff',
	top:90,
	width:'auto',
	height:'auto'
});
win.add(timesLabel);

var c1Label = Ti.UI.createLabel({
	text:':',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	height:35,
	color:'#fff',
	top:43,
	left:117,
	width:'auto',
	height:'auto'
});
win.add(c1Label);

var c2Label = Ti.UI.createLabel({
	text:':',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	height:35,
	color:'#fff',
	top:43,
	left:190,
	width:'auto',
	height:'auto'
});
win.add(c2Label);


var legLabel = Ti.UI.createLabel({
	text:'Leg 1',
	font:{fontSize:25,fontFamily:'Helvetica Neue'},
	color:'#222',
	top:15,
	width:'auto',
	height:'auto'
});
win.add(legLabel);

var invalidLabel = Ti.UI.createLabel({
	text:'Only completed legs can be edited.',
	font:{fontSize:14,fontFamily:'Helvetica Neue'},
	color:'#FFF',
	top:55,
	left:15,
	right:15,
	width:'auto',
	height:'auto'
});
win.add(invalidLabel);
invalidLabel.hide();

var sliderLabel1 = Ti.UI.createLabel({
	text:'1',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	color:'#333',
	top:104,
	height:'auto',
	left:15
});
win.add(sliderLabel1);

var sliderLabel2 = Ti.UI.createLabel({
	text:'36',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	color:'#333',
	top:104,
	height:'auto',
	left:293
});
win.add(sliderLabel2);


var basicSlider = Titanium.UI.createSlider({
	min:1,
	max:36,
	value:1,
	width:300,
	height:'auto',
	top:120
});

basicSlider.addEventListener('change',function(e)
{
	var sv = basicSlider.value;
	if(sv < 18){
		sv = Math.floor(sv);
	}else{
		sv = Math.ceil(sv);
	}
	currentLeg = sv;
	populateForm(sv);
});

var infoLabel = Ti.UI.createLabel({
	text:'It is important that legs be edited in order (lowest to highest) as an automatic adjustment will typically be made to the subsequent leg. ',
	color:'#000066',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	textAlign:'left',
	top:230,
	left:25,
	right:25,
	height:'auto'
});
win.add(infoLabel);

var bPrev = Titanium.UI.createButton({
	title:'Previous',
	enabled:true,
	height:40,
	width:145,
	left:10,
	top:160
});
bPrev.addEventListener('click', function()
{
	if(currentLeg > 1){
		currentLeg--;
		populateForm(currentLeg);
	}
	//bNext.enabled = true;
	tfHours.blur();
	tfMinutes.blur();
	tfSeconds.blur();
	basicSlider.value = currentLeg;
});
win.add(bPrev);

var bNext = Titanium.UI.createButton({
	title:'Next',
	height:40,
	width:145,
	left:165,
	top:160
});
bNext.addEventListener('click', function()
{
	if (currentLeg < 36){
		currentLeg++;
		populateForm(currentLeg);
	}
	//bPrev.enabled = true;
	tfHours.blur();
	tfMinutes.blur();
	tfSeconds.blur();
	basicSlider.value = currentLeg;
});
win.add(bNext);


win.addEventListener('focus', function(e){
	dbMain = Titanium.Database.open('main');
	
	var rowTK = dbMain.execute('SELECT listen,active FROM handoff_status WHERE handoff_id = 1');
	if(rowTK.isValidRow()){
		var listenStatus = rowTK.field(0);
		var activeStatus = rowTK.field(1);
		if((activeStatus == 1) && (listenStatus == 1)){
			timekeeperFlag = 0;
			invalidLabel.text = 'To edit, record handoff status must be set to On (go to Setup | Change Data Sharing Role).'; 
		}else{
			timekeeperFlag = 1;
			invalidLabel.text = 'Only completed legs can be edited.';
		}
	}
	rowTK.close();
	
	var rowCL = dbMain.execute('SELECT current_leg,race_id FROM settings WHERE setting_id = 1');
	if (rowCL.isValidRow()){
		maxLeg = rowCL.field(0);
		raceId = rowCL.field(1);
	}
	rowCL.close();
	
	// the following code checks to see whether the race is over and whether times have been recorded
	// for all legs
	var lastTime = 0;
	var rowLR = dbMain.execute('SELECT leg_end FROM relay_results WHERE leg_id = 36 AND race_id = ?',raceId);
	if(rowLR.isValidRow()){
		lastTime = rowLR.field(0);	
	}
	rowLR.close();
	if(lastTime > 0){
		maxLeg = 36;
	}
	
	row1 = dbMain.execute('SELECT race_id,team_name,team_number FROM settings WHERE setting_id = 1');
	if(row1.isValidRow()){
		raceId = row1.field(0);
		teamName = row1.field(1);
		teamNumber = row1.field(2);
	}
	row1.close();
	
	var row = dbMain.execute('SELECT COUNT(*) FROM relay_results WHERE race_id = ?',raceId);
	if (row.isValidRow()){
		relayResultCount = row.field(0);
	}
	row.close();

	win.add(basicSlider);
	populateForm(1);

});


function populateForm(legId){

	var runnerName = '';
	if(legId < 13){
		runnerName = getRunner(legId);
	} else if(legId < 25){
		runnerName = getRunner(legId - 12);
	} else if(legId < 37){
		runnerName = getRunner(legId - 24);
	}
	legLabel.text = 'Leg '+legId+' - '+runnerName;

	if((legId === 0) || (legId > (maxLeg-1)) || (timekeeperFlag === 0)){
		tfHours.hide();
		tfMinutes.hide();
		tfSeconds.hide();
		c1Label.hide();
		c2Label.hide();
		timesLabel.hide();
		invalidLabel.show();
	} else {
		row2 = dbMain.execute('SELECT leg_start,leg_end FROM relay_results WHERE leg_id = ? AND race_id = ?',legId,raceId);
		if(row2.isValidRow()){
			ls = row2.field(0);
			le = row2.field(1);
			
			if((le == null) || (le < ls)){
				
				if(legId < 36){
					Ti.API.info('it should not get here');
				} else {
					getFormDisplayTime(0);
					timesLabel.text = '';
				}
			} else {
				startOfCurrentLeg = ls;
				getFormDisplayTime(le - ls);
				startTime = getFormattedTime(ls);
				endTime = getFormattedTime(le);
				timesLabel.text = 'Start time: '+startTime+' - End time: '+endTime;
			}
		}
		row2.close();
	
		invalidLabel.hide();
		tfHours.show();
		tfMinutes.show();
		tfSeconds.show();
		c1Label.show();
		c2Label.show();
		timesLabel.show();
	}
}

function getFormDisplayTime(ms){
	currentTime = ms;
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

		hrStr = (hours < 10) ? ''+hours : ''+hours;
		minStr = (minutes < 10) ? '0'+minutes : ''+minutes;
		secStr = (seconds < 10) ? '0'+seconds : ''+seconds;
		
		tfHours.value = hrStr;
		tfMinutes.value = minStr;
		tfSeconds.value = secStr;
	} catch(err){
		Ti.API.info('Error thrown by getDisplayTime() function: '+err.error);
		tfHours.value = '0';
		tfMinutes.value = '00';
		tfSeconds.value = '00';
	}
	tfHours.keyboardType = Titanium.UI.KEYBOARD_NUMBER_PAD;
	tfMinutes.keyboardType = Titanium.UI.KEYBOARD_NUMBER_PAD;
	tfSeconds.keyboardType = Titanium.UI.KEYBOARD_NUMBER_PAD;
}

var a = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'You have made an error in entering the time. Only number values are allowed. Minutes and seconds must be less than 59.'
});

var c = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Your changes have been saved.'
});

var problemAlert = Titanium.UI.createAlertDialog({
	title:'Error',
	message:'The duration that you have entered is greater than the time available. The calculated finish time is in the future.'
});

saveBtn.addEventListener('click',function(e){
	try{
		var now = new Date();
		var nowMS = now.getTime();
		
		hours = parseInt(tfHours.value);
		Ti.API.info('hours: '+hours);
		if(isNaN(hours)){
			hours = 0;
		}
		minutes = parseInt(tfMinutes.value);
		seconds = parseInt(tfSeconds.value);

		if((hours > 50) || (minutes > 59) || (seconds > 59)){
			a.show();
		} else {
			duration = (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
			socl = parseInt(startOfCurrentLeg); // start of current leg, converting from a string
			endTime = socl + duration;
			
			if (endTime > nowMS){
				problemAlert.show();	
			}else{
				
				if((currentLeg > 0) && (raceId > 0) && (socl != null) && (socl < endTime)){
					dbMain.execute('UPDATE relay_results SET leg_start = ?,leg_end = ? WHERE leg_id = ? AND race_id = ?',socl,endTime,currentLeg,raceId);
					
					if(currentLeg < relayResultCount){
						nextLeg = currentLeg + 1;
						row2 = dbMain.execute('SELECT leg_start,leg_end FROM relay_results WHERE leg_id = ? AND race_id = ?',nextLeg,raceId);
						if(row2.isValidRow()){
							ls = row2.field(0);
							le = row2.field(1);
						}
						row2.close();
						legStart = endTime;
						legEnd = le;
						if(legStart > le){ // if the end time of the previous leg is greater than this end time, make the start and end time equal 
							legEnd = legStart;
						}
						dbMain.execute('UPDATE relay_results SET leg_start = ?, leg_end = ? WHERE leg_id = ? AND race_id = ?',legStart,legEnd,nextLeg,raceId);
					}
				}
				c.show();
				populateForm(currentLeg);
				tfHours.blur();
				tfMinutes.blur();
				tfSeconds.blur();
			}
		}
	}catch(err){
		Ti.API.info('saveBtn.addEventListener Error: '+err);
		a.show(); // error alert
	}
	
	win.backButtonTitle = 'Return';

});



