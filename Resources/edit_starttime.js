var win = Titanium.UI.currentWindow;
var newStartTime;
var dbMain;
var ss = '4dd912e8c4d73f1a5c7969685ec23038'; // shared secret
var pickerHour = 12;
var pickerMin = 0;
var eventMS = 0;
	
win.title = 'Edit Start Time';

Ti.include('biz_logic.js');

win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';
win.hideTabBar();

function pad(number, length) {
	var str = '' + number;
	while (str.length < length) {
		str = '0' + str;
	}
	return str;
}

var saveBtn = Titanium.UI.createButton({
	title:'Save'
});

win.setRightNavButton(saveBtn);


var label = Ti.UI.createLabel({
	text:'Enter a new start time for '+getRaceName()+' (which has a starting date of '+getRaceDisplayDate(getRaceDate())+') and hit Save. You may need to manually adjust leg times as well. ',
	color:'#000066',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	textAlign:'left',
	top:20,
	left:25,
	right:25,
	height:'auto'
});
win.add(label);

var value = new Date();
value.setMinutes(00);
value.setHours(12);
value.setSeconds(00);
		
var picker = Ti.UI.createPicker({
	bottom:0,
	type:Ti.UI.PICKER_TYPE_TIME,
	value:value
});

picker.addEventListener('change',function(e)
{
		var startTime = new Date(e.value);
		pickerHour = startTime.getHours();
		pickerMin = startTime.getMinutes();
});


// turn on the selection indicator (off by default)
picker.selectionIndicator = true;

win.add(picker);


win.addEventListener('open', function(e){
	var eventDate = new Date(getRaceDisplayDate(getRaceDate()));
	eventMS = eventDate.getTime();
	Ti.API.info("year: "+eventDate.getFullYear());
	Ti.API.info("month: "+eventDate.getMonth());
	Ti.API.info("day: "+eventDate.getDate());
	Ti.API.info("hours: "+eventDate.getHours());
	Ti.API.info("minutes: "+eventDate.getMinutes());
/*	dbMain = Titanium.Database.open('main');
	var row = dbMain.execute('SELECT team_name,team_number,assigned_team_start FROM settings WHERE setting_id = 1')
	if (row.isValidRow()){
		var tn = row.field(0);
		var tu = row.field(1);
		var as = row.field(2);
	}
	row.close();
*/
});

var problemFutureAlert = Titanium.UI.createAlertDialog({
	title:'Error',
	message:'You can only enter a new start time if the race has already started.'
});

var problemNonstartAlert = Titanium.UI.createAlertDialog({
	title:'Error',
	message:'You cannot edit the start time unless the race is underway. Go to the Timer tab and start the race and then return to this screen.'
});

var successAlert = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'The new start time for '+getRaceName()+' has been recorded.'
});


saveBtn.addEventListener('click',function(e){
	eventMS = eventMS + (pickerHour * 3600000) + (pickerMin * 60000);
	var now = new Date();
	if(eventMS > now.getTime()){
		// new race start is in the future, don't save, show alert
		problemFutureAlert.show();
	}else{
		// check to see if race has already started
		dbMain = Titanium.Database.open('main');
		var rowSave = dbMain.execute('SELECT start_of_relay,ready_to_start,current_leg FROM settings WHERE setting_id = 1');
		var startOfRelay = 0;
		var readyToStart = 0;
		var currentLeg = -1;
		if(rowSave.isValidRow()){
			startOfRelay = rowSave.field(0);
			readyToStart = rowSave.field(1);
			currentLeg = rowSave.field(2);
		}
		rowSave.close();

		if((startOfRelay > 0) && (readyToStart > 0) && (currentLeg > 0)){
			if(currentLeg == 1){
				dbMain.execute('UPDATE settings SET start_of_relay = ?,start_of_leg = ? WHERE setting_id = 1',eventMS,eventMS);
			}else{
				dbMain.execute('UPDATE settings SET start_of_relay = ? WHERE setting_id = 1',eventMS);
			}
			dbMain.execute('UPDATE relay_results SET leg_start = ? WHERE leg_id = 1 AND race_id = ?',eventMS,getRaceId());
			win.backButtonTitle = 'Return';
			win.setRightNavButton(null);
			successAlert.show();
		}else{
			problemNonstartAlert.show();
		}

	}

});



