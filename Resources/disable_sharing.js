var win = Titanium.UI.currentWindow;

var actInd;

win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';
win.hideTabBar();

var enableTrackingBtn = Titanium.UI.createButton({
	top:240,
	height:40,
	width:210,
	title: 'Disable Data Sharing',
	enabled:true
});

enableTrackingBtn.addEventListener('click',function(e){
	a.show();
});


var label0 = Ti.UI.createLabel({
	text:'Pressing the Disable Data Sharing button will prevent others from receiving updates on the selected race on the web or through their devices. Press Cancel to return to the previous screen or press Disable Data Sharing to proceed.',
	//color:'#420404',
	color:'#000066',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	top:20,
	left:25,
	textAlign:'left',
	width:260,
	height:'auto'
});


win.add(label0);

var b = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Action cancelled. Data sharing was not disabled.'
});

var a = Titanium.UI.createAlertDialog({
	title:'Caution!',
	message:'Are you sure you want to disable data sharing for the selected race?',
	buttonNames: ['Yes','No']
});


a.addEventListener('click', function(e){
	if(e.index == 0){
		enableTrackingBtn.hide();
		dbMain = Titanium.Database.open('main');
		dbMain.execute("UPDATE handoff_status SET active = 0, listen = 0, timekeeper = 1 WHERE handoff_id = 1");	
		label0.text = 'Data sharing has been disabled for the selected race. Go to Enable Data Sharing on the Setup tab to re-enable this feature.';
	} else {
		enableTrackingBtn.hide();
		label0.text = 'Data sharing for the selected race will remain in effect.';
	}
	win.backButtonTitle = 'Return';
});


// this is the main startup code
win.addEventListener('open',function(e){
	win.add(enableTrackingBtn);
});

