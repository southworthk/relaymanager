var win = Titanium.UI.currentWindow;

Ti.include('biz_logic.js');

var dbMain;
var raceId = -1;
var leftAlignChecklistItem = 62;
win.title = 'Pre-Race Checklist';

win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';

// need a function to check that there are twelve runners
function enoughRunners(requiredNumber){
	runnerCount = 0;
	var row = dbMain.execute('SELECT COUNT(runner_id) FROM runner');
	if (row.isValidRow()){
		runnerCount = row.field(0);
	}
	row.close();
	if (runnerCount >= requiredNumber){
		return true;
	} else {
		return false;
	}
}

function createAssignment(_raceId,rid,sid){
	dbMain.execute('INSERT INTO set_assignment(race_id, runner_id, set_id) VALUES (?,?,?)',_raceId,rid,sid);
}

// need a function to check to make sure that all sets have been assigned
function allSetsAssigned(numberOfSets){
	var rows = dbMain.execute('SELECT set_id FROM runner ORDER BY set_id ASC');
	var counter = 1;
	while (rows.isValidRow()){
		var set = rows.field(0);
		if(set != counter){
			break;
		}
		counter++;
		rows.next();
	}
	rows.close();
	if(counter != (numberOfSets+1)){
		return false;
	}else{
		return true;
	}
}

// need a function to check that a race has been selected
function raceSelected(){
	var row = dbMain.execute('SELECT race_id FROM settings WHERE setting_id = 1');
	if (row.isValidRow()){
		raceId = row.field(0);
	}
	row.close();
	Titanium.App.Properties.setInt('RaceId',raceId);
	if (raceId >= 0){
		return true;
	} else {
		return false;
	}
}

// need a function to check that there are no partial results in the results table
function noPartialResults(){
	resultCount = 0;
	var row = dbMain.execute('SELECT COUNT(race_id) FROM relay_results');
	if (row.isValidRow()){
		resultCount = row.field(0);
	}
	//Ti.API.info("resultCount: "+resultCount);
	row.close();
	if (resultCount != 0){
		return false;
	} else {
		return true;
	}	
}

// need a function to check that there is a team name
function teamName(){
	var tn;
	var row = dbMain.execute('SELECT team_name FROM settings WHERE setting_id = 1');
	if (row.isValidRow()){
		tn = row.field(0);
	}
	row.close();
	Titanium.App.Properties.setString('TeamName',tn);
	if (tn.length > 2){
		return true;
	} else {
		return false;
	}
}

// need a function to check that there is a team number
function teamNumber(){
	var tn = '-1';
	var row = dbMain.execute('SELECT team_number FROM settings WHERE setting_id = 1');
	if (row.isValidRow()){
		tn = row.field(0);
	}
	row.close();
	Titanium.App.Properties.setString('TeamNumber',tn);
	if (tn == '-1'){
		return false;
	} else {
		return true;
	}
}


var image1 = Titanium.UI.createImageView({
	url:'check.png',
	top:140,
	left:20,
	height:'auto',
	width:'auto'
});

var image2 = Titanium.UI.createImageView({
	url:'check.png',
	top:165,
	left:20,
	height:'auto',
	width:'auto'
});

var image3 = Titanium.UI.createImageView({
	url:'check.png',
	top:190,
	left:20,
	height:'auto',
	width:'auto'
});

var image4 = Titanium.UI.createImageView({
	url:'check.png',
	top:215,
	left:20,
	height:'auto',
	width:'auto'
});

var image5 = Titanium.UI.createImageView({
	url:'check.png',
	top:240,
	left:20,
	height:'auto',
	width:'auto'
});

var image6 = Titanium.UI.createImageView({
	url:'check.png',
	top:265,
	left:20,
	height:'auto',
	width:'auto'
});

var image7 = Titanium.UI.createImageView({
	url:'check.png',
	top:290,
	left:20,
	height:'auto',
	width:'auto'
});


// need a function to check that the team start time has been set
var label0 = Ti.UI.createLabel({
	text:'All items marked with an asterisk* must be completed (marked with a green check) before the Finalize Leg Assignments button is enabled.',
	//color:'#420404',
	color:'#000066',
	//font:{fontSize:16},
	//font:{fontSize:16, fontWeight:'bold'},
	top:20,
	left:15,
	textAlign:'left',
	width:275,
	height:'auto'
});


var label1 = Ti.UI.createLabel({
	text:'Required number of runners*',
	color:'black',
	top:140,
	left:leftAlignChecklistItem,
	textAlign:'left',
	width:'auto',
	height:'auto'
});

var label2 = Ti.UI.createLabel({
	text:'All sets assigned*',
	color:'black',
	top:165,
	left:leftAlignChecklistItem,
	textAlign:'left',
	width:'auto',
	height:'auto'
});

var label3 = Ti.UI.createLabel({
	text:'Race selected*',
	color:'black',
	top:190,
	left:leftAlignChecklistItem,
	textAlign:'left',
	width:'auto',
	height:'auto'
});

var label4 = Ti.UI.createLabel({
	text:'No partial race results*',
	color:'black',
	top:215,
	left:leftAlignChecklistItem,
	textAlign:'left',
	width:'auto',
	height:'auto'
});

var label5 = Ti.UI.createLabel({
	text:'Team name selected',
	color:'black',
	top:240,
	left:leftAlignChecklistItem,
	textAlign:'left',
	width:'auto',
	height:'auto'
});

var label6 = Ti.UI.createLabel({
	text:'Team number assigned',
	color:'black',
	top:265,
	left:leftAlignChecklistItem,
	textAlign:'left',
	width:'auto',
	height:'auto'
});

var label7 = Ti.UI.createLabel({
	text:'Leg information updated*',
	color:'black',
	top:290,
	left:leftAlignChecklistItem,
	textAlign:'left',
	width:'auto',
	height:'auto'
});


var makeAssignments = Titanium.UI.createButton({
	top:335,
	height:40,
	width:210,
	title: 'Finalize Leg Assignments',
	enabled:false
});

makeAssignments.addEventListener('click',function(e)
{
   if (raceId >= 0){
	   dbMain.execute('DELETE FROM set_assignment');
	   rows = dbMain.execute('SELECT runner_id,set_id FROM runner ORDER BY set_id');
	   while (rows.isValidRow()){
		   rid = rows.field(0);
		   sid = rows.field(1);
		   createAssignment(raceId,rid,sid);
		   rows.next();
	   }
	   rows.close();
	   
	   Ti.API.info('Debug - raceId: '+raceId);
	   dbMain.execute('UPDATE settings SET ready_to_start = 1,start_of_relay = 0, race_id = ? WHERE setting_id = 1',raceId);

	   // need to show alert to let user know that setup is complete
	   var a = Titanium.UI.createAlertDialog({
			title:'Action Complete',
			message:'Pre-race setup is now complete. You can now start your race by clicking on the Timer tab.'
		});
	   a.show();
	   makeAssignments.hide();
	   win.backButtonTitle = 'Return';
   } else {
	   var b = Titanium.UI.createAlertDialog({
			title:'Error',
			message:'Please correct or complete all items in the checklist before trying to finalize leg assignments.'
		});
	   b.show();
   }

});



win.addEventListener('open', function(){
	makeAssignments.enabled = false;
	Ti.API.info('this is the open event');
	dbMain = Titanium.Database.open('main');
	var er = enoughRunners(12); // 1
	if (er) { win.add(image1); }
	var aa = allSetsAssigned(12); // 2
	if (aa) { win.add(image2); }
	var rs = raceSelected(); // 3
	Ti.API.info('rs: '+rs);
	if (rs) { win.add(image3); }
	var pr = noPartialResults(); // 4
	if (pr) { win.add(image4); }
	var te = teamName(); // 5
	if (te) { win.add(image5); }
	var tn = teamNumber(); // 6
	if (tn) { win.add(image6); }
	var lu = haveLegsBeenUpdated(); // 7
	if (lu) { win.add(image7); }

	if (er){
		if (aa){
			if (rs){
				if (lu) {
					makeAssignments.enabled = true;
				}
			}
		}
	}
});

win.add(label0);
win.add(label1);
win.add(label2);
win.add(label3);
win.add(label4);
win.add(label5);
win.add(label6);
win.add(label7);
win.add(makeAssignments);
