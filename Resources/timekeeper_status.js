var win = Titanium.UI.currentWindow;
win.title = 'Time Keeping Status';
win.backgroundImage = 'gradientBackground.png';

dbMain = Titanium.Database.open('main');
var timeKeeperStatus = 0;
var statusTextOn = 'The time keeping functionality for this device is currently set to On.';
var statusTextOff = 'The time keeping functionality for this device is currently set to Off.';

var statusLabel = Titanium.UI.createLabel({
	color:'#000066',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	textAlign:'left',
	top:20,
	left:25,
	right:25,
	height:'auto'
});
win.add(statusLabel);

var helpLabel = Titanium.UI.createLabel({
	text:'If data sharing has been enabled and the time keeping status is set to on, you will be able to record handoffs for your team. It is important that only one device record handoffs and have time keeping status set to On at any given time.',
	color:'#000066',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	textAlign:'left',
	top:145,
	left:25,
	right:25,
	height:'auto'
});
win.add(helpLabel);

var tb1 = Titanium.UI.createTabbedBar({
	labels:['Off', 'On'],
	backgroundColor:'#336699',
	top:95,
	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	height:25,
	width:200,
	index:0
});

win.add(tb1);

tb1.addEventListener('click', function(e)
{
	if(tb1.index == 0){
		dbMain.execute('UPDATE handoff_status SET timekeeper = 0 WHERE handoff_id = 1');
		statusLabel.text = statusTextOff;	
	}else{
		dbMain.execute('UPDATE handoff_status SET timekeeper = 1 WHERE handoff_id = 1');
		statusLabel.text = statusTextOn;		
	}
});

win.addEventListener('open',function(e){
	var openStatus = dbMain.execute('SELECT timekeeper FROM handoff_status WHERE handoff_id = 1');
	if(openStatus.isValidRow()){
			timeKeeperStatus = openStatus.field(0);
		}
	openStatus.close();
	if(timeKeeperStatus == 0){
		tb1.index = 0;
		statusLabel.text = statusTextOff;
	}else{
		tb1.index = 1;
		statusLabel.text = statusTextOn;
	}
});

