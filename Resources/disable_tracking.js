var win = Titanium.UI.currentWindow;

var actInd;

win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';
win.hideTabBar();

var enableTrackingBtn = Titanium.UI.createButton({
	top:240,
	height:40,
	width:210,
	title: 'Disable Tracking',
	enabled:true
});

enableTrackingBtn.addEventListener('click',function(e){
	a.show();
});


var raceName = '';
var errorMsg = 'You have not yet completed all of the steps in Prepare for Race Start. Return to the Setup menu and complete those steps before proceeding.';

//need a function to check that the team start time has been set
var label0 = Ti.UI.createLabel({
	text:'Pressing the Disable Tracking button below will remove the token for tracking the selected race on the web. Press Cancel to return to the previous screen or press Disable Tracking to proceed.',
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
	message:'Action cancelled. Tracking was not disabled.'
});

var a = Titanium.UI.createAlertDialog({
	title:'Caution!',
	message:'Are you sure you want to disable tracking for the selected race?',
	buttonNames: ['Yes','No']
});


a.addEventListener('click', function(e){
	if(e.index == 0){
		enableTrackingBtn.hide();
		dbMain = Titanium.Database.open('main');
		dbMain.execute("UPDATE team_identity SET team_prediction_key = -1, tracking_enabled = 0 WHERE team_id = 1");	
		label0.text = 'Tracking has been disabled for the selected race. Go to Enable Tracking on the Setup tab to re-enable this feature.';
	} else {
		enableTrackingBtn.hide();
		label0.text = 'Tracking for the selected race will remain in effect.';
	}
	win.backButtonTitle = 'Return';
});


// this is the main startup code
win.addEventListener('open',function(e){
	win.add(enableTrackingBtn);
});

