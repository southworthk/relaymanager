var win = Titanium.UI.currentWindow;
win.title = 'Change Role';
win.backgroundImage = 'gradientBackground.png';

Ti.include('biz_logic.js');
Ti.include('get_displaytime.js');
var prevLeg = getCurrentLeg();

var data = [];

data[0] = Ti.UI.createTableViewRow({title:'Select Current Leg',hasChild:true,test:'leg_list.js'});

// create table view
var tableview = Titanium.UI.createTableView({
	data:data,
	bottom:30,
	left:20,
	right:20,
	//height:178,
	height:45,
	borderWidth:2,
	borderRadius:10,
	borderColor:'#222'
});

tableview.addEventListener('click', function(e)
{
	var controllerURL = e.rowData.test;
	var pageTitle;
	switch(e.index){
	case 0:
		pageTitle = 'Select Current Leg';
		break;
/*	case 1:
		pageTitle = 'Select AG/Div';
		break;
*/
	}
	//Titanium.App.Properties.setInt('CurrentRunnerId',runnerId);
	var win2 = Titanium.UI.createWindow({
		url:controllerURL,
		title:pageTitle
	});
	Titanium.UI.currentTab.open(win2,{animated:true});
});


dbMain = Titanium.Database.open('main');
var listenStatus = 0;
var timekeeperStatus = 0;
var statusTextOn = 'The listening status for this device is currently set to On.';
var statusTextOff = 'The listening status for this device is currently set to Off.';
var handoffTextOn = 'The record handoff status for this device is currently set to On.';
var handoffTextOff = 'The record handoff status for this device is currently set to Off.';

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

var handoffLabel = Titanium.UI.createLabel({
	color:'#000066',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	textAlign:'left',
	top:130,
	left:25,
	right:25,
	height:'auto'
});
win.add(handoffLabel);


var tb1 = Titanium.UI.createTabbedBar({
	labels:['Off', 'On'],
	backgroundColor:'#336699',
	top:80,
	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	height:25,
	width:200,
	index:0
});

win.add(tb1);

tb1.addEventListener('click', function(e)
{
	if(tb1.index == 0){
		dbMain.execute('UPDATE handoff_status SET listen = 0 WHERE handoff_id = 1');
		statusLabel.text = statusTextOff;	
	}else{
		dbMain.execute('UPDATE handoff_status SET listen = 1, timekeeper = 0 WHERE handoff_id = 1');
		statusLabel.text = statusTextOn;	
		handoffLabel.text = handoffTextOff;	
		tb2.index = 0;	
	}
});

var tb2 = Titanium.UI.createTabbedBar({
	labels:['Off', 'On'],
	backgroundColor:'#336699',
	top:190,
	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	height:25,
	width:200,
	index:0
});

win.add(tb2);

tb2.addEventListener('click', function(e)
{
	if(tb2.index == 0){
		dbMain.execute('UPDATE handoff_status SET timekeeper = 0 WHERE handoff_id = 1');
		handoffLabel.text = handoffTextOff;	
	}else{
		dbMain.execute('UPDATE handoff_status SET listen = 0, timekeeper = 1 WHERE handoff_id = 1');
		statusLabel.text = statusTextOff;
		handoffLabel.text = handoffTextOn;	
		handoffAlert.message = 'Is leg '+getCurrentLeg()+' the current leg and '+getCurrentRunner()+' the current runner?';
		handoffAlert.show();
		tb1.index = 0;	
	}
});

var handoffAlert = Titanium.UI.createAlertDialog({
	title:'Handoff Alert',
	buttonNames:['Yes','No'],
	message:''
});

var missingLegAlert = Titanium.UI.createAlertDialog({
	title:'Missing Data Alert',
	message:''
});

var selectCurrentLegAlert = Titanium.UI.createAlertDialog({
	title:'Select Current Leg',
	message:'Please select the current leg from the drop down list at the bottom of the page.'
});

handoffAlert.addEventListener('click',function(e){
	// TODO: if no, determine what the current leg is
	// check to see if all previous legs have a status of 3
	// if no, have them set the current leg and let them know that
	// the other data will fill in as it's available
	// let them know when the last heartbeat from the other device was recorded 
	if(e.index == 0){
		var currLeg = getCurrentLeg();
		var missingLegs = getCountofMissingLegs(currLeg);
		Ti.API.info("Missing data for "+missingLegs+" handoffs");
		var handoffs = currLeg--;
		if(missingLegs > 0){
			missingLegAlert.message = 'You are currently missing data for '+missingLegs+' out of '+handoffs+' handoffs. This data will be retrieved from the server as it becomes available.';
			//missingLegAlert.show();
		}
	}else{
		win.add(tableview);
		selectCurrentLegAlert.show(0);
	}
});

win.addEventListener('focus',function(e){
	var cLeg = getCurrentLeg();
	if(cLeg > prevLeg){
		data[0].title = 'Current Leg: '+cLeg;
	}	
});

win.addEventListener('open',function(e){
	var openStatus = dbMain.execute('SELECT listen,timekeeper FROM handoff_status WHERE handoff_id = 1');
	if(openStatus.isValidRow()){
			listenStatus = openStatus.field(0);
			timekeeperStatus = openStatus.field(1);
		}
	openStatus.close();
	if(listenStatus == 0){
		tb1.index = 0;
		statusLabel.text = statusTextOff;
	}else{
		tb1.index = 1;
		statusLabel.text = statusTextOn;
	}
	
	if(timekeeperStatus == 0){
		tb2.index = 0;
		handoffLabel.text = handoffTextOff;
	}else{
		tb2.index = 1;
		handoffLabel.text = handoffTextOn;
	}
	//data[0].title = 'This is a test';
});

