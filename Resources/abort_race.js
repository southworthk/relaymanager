var win = Titanium.UI.currentWindow;

win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';
win.hideTabBar();

//need a function to check that the team start time has been set
var label0 = Ti.UI.createLabel({
	text:'Warning! Pressing the Abort Race button below will PERMANENTLY stop the race and delete partially recorded results. Once the race has been aborted, it can only be started from the beginning. Press cancel to return to the previous screen or press Abort Race to proceed.',
	//color:'#420404',
	color:'#990033',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	top:20,
	left:25,
	textAlign:'left',
	width:260,
	height:'auto'
});

win.add(label0);

var a = Titanium.UI.createAlertDialog({
	title:'Caution!',
	message:'Are you sure you want to abort the race?',
	buttonNames: ['Yes','No']
});

a.addEventListener('click', function(e){
	if (e.index == 0){
		Ti.API.info('The race has been aborted.');
		Titanium.App.Properties.setInt('CurrentLeg',0);
		Titanium.App.Properties.setDouble('StartOfRelay',0);
		Titanium.App.Properties.setDouble('StartOfLeg',0);
		var dbMain = Titanium.Database.open('main');
		dbMain.execute('UPDATE settings SET ready_to_start = 0, start_of_relay = 0, start_of_leg = 0, current_leg = -1 WHERE setting_id = 1');
		dbMain.execute("UPDATE handoff_status SET active = 0, listen = 0, timekeeper = 1 WHERE handoff_id = 1");
		//dbMain.execute('DELETE FROM relay_results');
		abortRaceBtn.hide();
		b.message = 'The race has been successfully aborted.';
		label0.color = '#000066';
		label0.text = 'Partial relay results have not been deleted. To remove those results select that option from the Setup menu. '
		//b.show();
		win.backButtonTitle = 'Return';
	} else {
		b.show();
	}
});

var b = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Action cancelled. Race not aborted.'
});

var abortRaceBtn = Titanium.UI.createButton({
	top:240,
	height:40,
	width:210,
	title: 'Abort Race',
	enabled:true
});

abortRaceBtn.addEventListener('click',function(e){
	a.show();
});

win.add(abortRaceBtn);