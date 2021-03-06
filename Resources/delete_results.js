var win = Titanium.UI.currentWindow;

win.backgroundImage = 'gradientBackground.png';
Ti.include('biz_logic.js');

win.backButtonTitle = 'Cancel';
win.hideTabBar();

//need a function to check that the team start time has been set
var label0 = Ti.UI.createLabel({
	text:'Warning! Pressing the Delete Results button below will PERMANENTLY remove all race results. Once the results have been deleted, they CANNOT be recovered. Press cancel to return to the previous screen or press Delete Results to proceed.',
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
	message:'Are you sure you want to delete all results?',
	buttonNames: ['Yes','No']
});

a.addEventListener('click', function(e){
	if (e.index == 0){
		Ti.API.info('Race results have been deleted.');
		var raceId = getRaceId();
		var dbMain = Titanium.Database.open('main');
		dbMain.execute('DELETE FROM relay_results WHERE race_id = ?',raceId);
		dbMain.execute('UPDATE settings SET ready_to_start = 0, start_of_relay = 0, start_of_leg = 0, end_of_relay = 0, current_leg = -1 WHERE setting_id = 1');
		dbMain.execute("UPDATE handoff_status SET active = 0, listen = 0, timekeeper = 1, slave_token = 'N/A', spectator_token = 'N/A' WHERE handoff_id = 1");
		dbMain.execute("UPDATE network_status SET s_s = 0, s_1 = 0, s_2 = 0, s_3 = 0, s_4 = 0, s_5 = 0, s_6 = 0, s_7 = 0, s_8 = 0, s_9 = 0, s_10 = 0, s_11 = 0, s_12 = 0, s_13 = 0, s_14 = 0, s_15 = 0, s_16 = 0, s_17 = 0, s_18 = 0, s_19 = 0, s_20 = 0, s_21 = 0, s_22 = 0, s_23 = 0, s_24 = 0, s_25 = 0, s_26 = 0, s_27 = 0, s_28 = 0, s_29 = 0, s_30 = 0, s_31 = 0, s_32 = 0, s_33 = 0, s_34 = 0, s_35 = 0, s_36 = 0 WHERE network_id = 1");
		b.message = 'All race results have been deleted.';
		//b.show();
		win.backButtonTitle = 'Return';
		deleteResultsBtn.hide();
		label0.color = '#000066';
		label0.text = 'Roster and team information has been retained, but you will need to select Prepare for Race Start from the Setup menu before recording the start of a race. You will also need to re-enable data sharing if that option was previously enabled. ';
	} else {
		b.show();
	}
});

var b = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Action cancelled. Results were not deleted.'
});

var deleteResultsBtn = Titanium.UI.createButton({
	top:240,
	height:40,
	width:210,
	title: 'Delete Results',
	enabled:true
});

deleteResultsBtn.addEventListener('click',function(e){
	a.show();
});

win.add(deleteResultsBtn);