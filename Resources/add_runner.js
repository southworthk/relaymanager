var win = Titanium.UI.currentWindow;

var sview = Ti.UI.createScrollView({
	contentWidth:'auto',
	contentHeight:'auto',
	top:0,
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:false
});

win.barColor = 'black';

var editMode = 0;
var runnerId = -1;
var setId = -1;
var agId = -1;

//create table view data object
var data = [];

data[0] = Ti.UI.createTableViewRow({title:'Assign Legs/Set',hasChild:true,test:'set_list.js'});
data[1] = Ti.UI.createTableViewRow({title:'Select Age Group',hasChild:true,test:'agegroup_list.js'});
//data[2] = Ti.UI.createTableViewRow({title:'Row 3',hasChild:true,test:'#900'});
//data[3] = Ti.UI.createTableViewRow({title:'Row 4',hasChild:true,test:'#fff'});

Ti.include('get_displaytime.js');

// create table view
var tableview = Titanium.UI.createTableView({
	data:data,
	bottom:30,
	left:20,
	right:20,
	//height:178,
	height:89,
	borderWidth:2,
	borderRadius:10,
	borderColor:'#222'
});

// create table view event listener
tableview.addEventListener('click', function(e)
{
	var controllerURL = e.rowData.test;
	var pageTitle;
	switch(e.index){
	case 0:
		pageTitle = 'Assign Legs';
		break;
	case 1:
		pageTitle = 'Select AG/Div';
		break;
	}
	//Titanium.App.Properties.setInt('CurrentRunnerId',runnerId);
	var win = Titanium.UI.createWindow({
		url:controllerURL,
		title:pageTitle
	});
	Titanium.UI.currentTab.open(win,{animated:true});
});

// add table view to the window
sview.add(tableview);

//win.backgroundColor = 'gray';
win.backgroundImage = 'gradientBackground.png';

var mileageSliderLabel = Titanium.UI.createLabel({
	text:'Average Weekly Mileage: ' ,
	color:'white',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:15
	},
	top:140,
	left:25,
	height:'auto'
});

var mileageSlider = Titanium.UI.createSlider({
	min:0,
	max:120,
	value:25,
	width:275,
	height:'auto',
	top:170
});
mileageSlider.addEventListener('change',function(e)
{
	mileageSliderLabel.text = 'Average Weekly Distance: ' + Math.round(e.value) + ' miles';
});

sview.add(mileageSliderLabel);
sview.add(mileageSlider);

var speedSliderLabel = Titanium.UI.createLabel({
	text:'Average 10K Pace' ,
	color:'white',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:15
	},
	top:210,
	left:25,
	height:'auto'
});

var paceSliderLabel = Titanium.UI.createLabel({
	text:'Pace: ' ,
	color:'white',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:15
	},
	top:210,
	left:178,
	height:'auto'
});

var speedSlider = Titanium.UI.createSlider({
	min:5,
	max:14,
	value:0.1,
	width:275,
	height:'auto',
	top:240
});

speedSlider.addEventListener('change',function(e)
{
	var mph = e.value;
	speedSliderLabel.text = '10K Speed: ' + roundNumber(mph,1) + ' mph';
	var pace = speedToPace(mph);
	paceSliderLabel.text = 'Pace: ' + pace + ' /mile';
});

var tfMinPace = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:240,
	left:115,
	width:38,
	hintText:'10',
	keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var tfSecPace = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:240,
	left:165,
	width:38,
	hintText:'00',
	keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,
	//returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var colonLabel = Titanium.UI.createLabel({
	text:':' ,
	color:'white',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:25
	},
	top:240,
	width:'auto',
	height:'auto'
});

var minMileLabel = Titanium.UI.createLabel({
	text:'min/mile' ,
	color:'white',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:17
	},
	top:247,
	left:210,
	height:'auto'
});

sview.add(tfMinPace);
sview.add(tfSecPace);
sview.add(colonLabel);
sview.add(minMileLabel);

sview.add(speedSliderLabel);
//sview.add(paceSliderLabel);
//sview.add(speedSlider);
win.addEventListener('click',function(){
	tfSecPace.blur();
});


win.backButtonTitle = 'Cancel';

var contactadd = Titanium.UI.createButton({
	systemButton:Titanium.UI.iPhone.SystemButton.CONTACT_ADD
});
contactadd.addEventListener('click', function()
{
// TODO: add another runner
});

var tf1 = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:20,
	left:20,
	width:275,
	hintText:'First Name*',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

tf1.addEventListener('focus', function(){
	win.setRightNavButton(saveBtn);
});

tf1.addEventListener('return', function()
{
	tf1.blur();
});

var tf2 = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:75,
	left:20,
	width:275,
	hintText:'Last Name',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

tf2.addEventListener('focus', function(){
	win.setRightNavButton(saveBtn);
});

tf2.addEventListener('return', function()
{
	tf2.blur();
});

var saveBtn = Titanium.UI.createButton({
	title:'Save'
});

saveBtn.addEventListener('click',function(e){
	var firstName = tf1.value;
	var lastName = tf2.value;
	
	var minPace = tfMinPace.value;
	minPace = (minPace.length == 1) ? "0"+minPace : minPace;
	var secPace = tfSecPace.value;
	secPace = (secPace.length == 1) ? "0"+secPace : secPace;
	var speed = paceToSpeed(minPace+":"+secPace);
	
	var mileage = Math.round(mileageSlider.value);
	setId = Titanium.App.Properties.getInt('SetId');
	setId = (setId == null) ? 0 : setId;
	agId = Titanium.App.Properties.getInt('AgeGroupId');
	Ti.API.info('save btn age group id: '+agId);
	var raceId = Titanium.App.Properties.getInt('RaceId');
	Ti.API.info('setId: '+setId+'; AgeGroupId: '+agId+';RaceId: '+raceId);
	var dbRunner = Titanium.Database.open('main');

	if (editMode == 0){
		win.setRightNavButton(contactadd);
		if (firstName != null){
			lastName = (lastName == null) ? '' : lastName;
			dbRunner.execute('INSERT INTO runner(first_name,last_name,ten_k_speed,miles_per_week,agegroup_id,set_id) VALUES(?,?,?,?,?,?)',firstName,lastName,speed,mileage,agId,setId);
		}
		
		// if a set has been selected, save the selection to the database
		//TODO: we could insert all the runner id's into this table once all assignments are made
		// at roster finalization (once the race has been selected and so on).
		//if(raceId >= 0 && runnerId >= 0 && setId >= 0){
		//	dbRunner.execute('INSERT INTO set_assignment(race_id,runner_id,set_id) VALUES(?,?,?',raceId,runnerId,setId);
		//}
		
		// reset values to defaults
		tf1.value = '';
		tf2.value = '';
		speedSlider.value = 10.0;
		mileageSlider.value = 25;
		win.backButtonTitle = 'Return';
		//tf1.focus();
	} else {
		runnerId = Titanium.App.Properties.getInt('CurrentRunnerId');
		win.setRightNavButton(null);
		if (firstName != null){
			lastName = (lastName == null) ? '' : lastName;
/*			Ti.API.info('setId: '+setId);
			Ti.API.info('runnerId: '+runnerId);
			Ti.API.info('firstName: '+firstName);
			Ti.API.info('lastName: '+lastName);
			Ti.API.info('speed: '+speed);
			Ti.API.info('mileage: '+mileage);
			Ti.API.info('agId: '+agId);
*/
			dbRunner.execute('UPDATE runner SET first_name = ?,last_name = ?,ten_k_speed = ?,miles_per_week = ?,agegroup_id = ?,set_id = ? WHERE runner_id = ?',firstName,lastName,speed,mileage,agId,setId,runnerId);
		}
		if(raceId >= 0 && runnerId >= 0 && setId >= 0){
			// TODO: need to check and see that a record exists for set_assignment
			//dbRunner.execute('UPDATE set_assignment SET set_id = ? WHERE race_id = ? AND runner_id = ?',setId,raceId,runnerId);
		}
		win.close();
		//win.backButtonTitle = 'Return';
	}
	

});

win.setRightNavButton(null);

sview.add(tf1);
sview.add(tf2);

win.addEventListener('open', function(){
	Ti.API.info('focus event listener fired, AgeGroupId: '+agId);
	editMode = win.editStatus; // value passed from roster.js
	runnerId = win.rid; // runner id pass from roster.js
	var speed = 10.0;
	var mileage = 25;
	if (editMode == 1){
		var dbRunner = Titanium.Database.open('main');
		var row = dbRunner.execute('SELECT runner_id,first_name,last_name,ten_k_speed,miles_per_week,agegroup_id,set_id FROM runner WHERE runner_id = ?',runnerId);
		if(row.isValidRow()){
			var runnerId = row.field(0);
			var firstName = row.field(1);
			var lastName = row.field(2);
			speed = row.field(3);
			mileage = row.field(4);
			tf1.value = firstName;
			tf2.value = lastName;
			//speed = (speed == null) ? 10 : speed;
			var pace = speedToPace(speed);
			var cPos = pace.indexOf(":");
			var paceMin = pace.substring(0,cPos);
			paceMin = (paceMin.length == 1) ? "0"+paceMin : paceMin;
			var paceSec = pace.substring(cPos+1);
			tfMinPace.value = paceMin;
			tfSecPace.value = paceSec;
			
			mileage = (mileage == null) ? 25 : mileage;
			//speedSlider.value = speed;
			mileageSlider.value = mileage;
			agId = row.field(5);
			setId = row.field(6);
			agId = (agId == null) ? -1 : agId;
			setId = (setId == null) ? -1 : setId;
			Titanium.App.Properties.setInt('AgeGroupId',agId);
			Titanium.App.Properties.setInt('SetId',setId);
		}
		row.close();
		win.setRightNavButton(saveBtn);
		//tf1.focus();
	}
});

win.add(sview);
