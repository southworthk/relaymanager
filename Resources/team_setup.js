var win = Titanium.UI.currentWindow;
var newStartTime;
var dbMain;
var ss = '4dd912e8c4d73f1a5c7969685ec23038'; // shared secret	

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

var tf1 = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:20,
	left:20,
	width:275,
	hintText:'Team Name',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var tf2 = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:75,
	left:20,
	width:275,
	hintText:'Team Number',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var saveBtn = Titanium.UI.createButton({
	title:'Save'
});

win.setRightNavButton(saveBtn);

win.add(tf1);
win.add(tf2);

var label = Ti.UI.createLabel({
	text:'Assigned start time: 12:00 p.m.',
	top:125,
	width:'auto',
	height:'auto',
	textAlign:'center',
	color:'white'
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
			var sTime = new Date(e.value);
			updateTimeDisplay(sTime);

		});


function updateTimeDisplay(newDate){
		var startTime = newDate;
		var hour = startTime.getHours();
		var min = pad(startTime.getMinutes(),2);
		var am = (hour > 12) ? ' p.m.' : ' a.m.';
		var dispHour = (hour > 12) ? hour - 12 : hour;
		newStartTime = hour+':'+min;
		label.text = 'Assigned start time: '+dispHour+':'+min+am;	
};

// turn on the selection indicator (off by default)
picker.selectionIndicator = true;

win.add(picker);


win.addEventListener('open', function(e){
	dbMain = Titanium.Database.open('main');
	var row = dbMain.execute('SELECT team_name,team_number,assigned_team_start FROM settings WHERE setting_id = 1')
	if (row.isValidRow()){
		var tn = row.field(0);
		var tu = row.field(1);
		var as = row.field(2);
		if(tn != '-1'){
			tf1.value = tn;
		};
		if(tu != null){
			tf2.value = tu;
		}
		//TODO: need to add code for assigned start time
		if(as != null && as.length > 2){
			var cIndex = as.indexOf(":");
			var nHour = as.substring(0,cIndex);
			var nMin = as.substring(cIndex+1);
			var cHour = parseInt(nHour);
			var cMin = parseInt(nMin);
			
			var storedDate = new Date();
			storedDate.setMinutes(cMin);
			storedDate.setHours(cHour);
			storedDate.setSeconds(00);
			picker.setValue(storedDate);
			updateTimeDisplay(storedDate);
		}
	}
	row.close();
});

saveBtn.addEventListener('click',function(e){
	Ti.App.Properties.setString('TeamName',tf1.value);
	Ti.App.Properties.setString('TeamNumber',tf2.value);
	Ti.App.Properties.setString('AssignedTeamStart',newStartTime);
	dbMain.execute('UPDATE settings SET team_name = ?, team_number = ?, assigned_team_start = ? WHERE setting_id = 1',tf1.value,tf2.value,newStartTime);

	win.backButtonTitle = 'Return';
	win.setRightNavButton(null);
});



