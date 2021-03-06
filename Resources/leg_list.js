var win = Titanium.UI.currentWindow;
win.barColor = 'black';
Ti.include('biz_logic.js');

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var tableData = [];
var previousRowData;
var selectedId;

win.backButtonTitle = 'Cancel';

var handoffAlert = Titanium.UI.createAlertDialog({
	title:'Set New Current Leg',
	buttonNames:['Yes','No'],
	message:'This step is irreversible and can result in data loss. Do you wish to proceed?'
});

var saveBtn = Titanium.UI.createButton({
	title:'Save'
});

saveBtn.addEventListener('click',function(){
	handoffAlert.show();
});

handoffAlert.addEventListener('click',function(e){
	
	// TODO: step through this code
	if(e.index == 0){
		var currentLeg = selectedId;
		var prevLeg = getCurrentLeg();
		Titanium.App.Properties.setInt('CurrentLeg',currentLeg);
		//TODO: save the current time to end the current leg
		var dbMainSCL = Ti.Database.open('main');
		if(currentLeg > prevLeg){
			var rid = getRaceId();
			var now = new Date();
			var ms = now.getTime();
			dbMainSCL.execute('UPDATE relay_results SET leg_end = ? WHERE leg_id = ? AND race_id = ?',ms,prevLeg,rid);
			dbMainSCL.execute('DELETE FROM relay_results WHERE leg_id > ?',prevLeg);
			dbMainSCL.execute('UPDATE settings SET current_leg = ? WHERE setting_id = 1',currentLeg);
			for (i=prevLeg; i<currentLeg; i++){
				dbMainSCL.execute('INSERT INTO relay_results(race_id,leg_id,leg_start,leg_end) VALUES(?,?,0,0)',rid,i+1);
			}
		}
		win.setRightNavButton(null);
		win.backButtonTitle = 'Return';
	}
});

win.setRightNavButton(null);

//create table view
var tableview = Titanium.UI.createTableView({
	data:tableData
});

tableview.addEventListener('click', function(e){
	win.setRightNavButton(saveBtn);
	if(previousRowData != null){
		previousRowData.hasCheck = false;
	}
	selectedId = e.rowData.test;
	e.rowData.hasCheck = true;
	previousRowData = e.rowData;
});

win.add(tableview);

win.addEventListener('focus', function(){

	for(i=1; i < 37; i++){
		var setNum = getSetNumberForLegNum(i);
		var fn = getRunner(setNum);
		var desc = 'Leg '+i+' - '+fn;
		tableData.push({title:desc, hasChild:false, test:i});
	}
	tableview.setData(tableData);
});

