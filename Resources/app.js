// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

Ti.include('biz_logic.js');

function tableRowCount(tableName){
	var count = 0;
	var sqlStatement = 'SELECT COUNT(*) FROM '+tableName;
	//Ti.API.info(sqlStatement);
	var row = dbMain.execute(sqlStatement);
	if(row.isValidRow()){
		count = row.field(0);
	}
	row.close();
	return count;
};

var reportData = [
             	{title:'Select Race', hasChild:true, test:'../examples/tab_groups.js'},
             	{title:'Manage Roster', hasChild:true, test:'../examples/window_properties.js'},
             	{title:'Review Checklist', hasChild:true, test:'../examples/window_standalone.js'}
     ];


// create tab group
var tabGroup = Titanium.UI.createTabGroup();
var dbMain;

// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Home',
    backgroundColor:'#fff'
    //backgroundImage:'homescreen.png'
});
var tab1 = Titanium.UI.createTab({  
    icon:'53-house.png',
    title:'Home',
    window:win1
});

//win1.title = 'Relay Manager';
win1.title = '';
if (Titanium.Platform.name == 'iPhone OS')
{
	win1.hideNavBar();
}

var versionNumber = Titanium.UI.createLabel({
	top: 360,
	color:'#333333',
	text:'Version 1.7.1',
	font:{fontSize:10,fontFamily:'Helvetica Neue'},
	width:'auto',
	height:'auto'
});

var labelTeamName = Titanium.UI.createLabel({
	top: 125,
	color:'white',
	text:'Team Name Not Selected',
	font:{fontSize:20,fontFamily:'Helvetica Neue', fontWeight:'bold'},
	width:'auto',
	height:'auto'
});

var labelRaceName = Ti.UI.createLabel({
	top: 155,
	color:'#333333',
	text:'Race Not Selected',
	font:{fontSize:18,fontFamily:'Helvetica Neue'},
	width:'auto',
	height:'auto'
});

var labelRaceDate = Ti.UI.createLabel({
	top: 185,
	color:'#333333',
	text:'',
	font:{fontSize:18,fontFamily:'Helvetica Neue'},
	width:'auto',
	height:'auto'	
});

var labelCountDown = Ti.UI.createLabel({
	top: 230,
	color:'white',
	text:'',
	font:{fontSize:14,fontFamily:'Helvetica Neue'},
	width:'auto',
	height:'auto'	
});

var tf1 = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:20,
	//left:20,
	width:250,
	hintText:'First Name',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var tf2 = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:75,
	//left:20,
	width:250,
	hintText:'Last Name',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var tf3 = Titanium.UI.createTextField({
	color:'#336699',
	height:35,
	top:130,
	//left:20,
	width:250,
	hintText:'Email Address',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var registerBtn = Titanium.UI.createButton({
	top:190,
	height:40,
	width:100,
	left:50,
	title: 'Register',
	enabled:true
});

win1.barColor = 'black';
win1.backgroundImage = 'home06.png';

//
// create setup tab and root window
//
var win2 = Titanium.UI.createWindow({  
	url:'setup_view.js',
    title:'Setup',
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({  
    icon:'20-gear2.png',
    title:'Setup',
    window:win2
});

var win3 = Titanium.UI.createWindow({ 
	url:'timer.js',
	title:'Timer',
 	backgroundImage:'gradientBackground.png'
});

var tab3 = Titanium.UI.createTab({  
 icon:'78-stopwatch.png',
 title:'Timer',
 window:win3
});

//
//create reports tab and root window
//
var win4 = Titanium.UI.createWindow({  
	url:'reports.js',
	title:'Reports',
	backgroundColor:'#fff'
});
var tab4 = Titanium.UI.createTab({  
	icon:'17-bar-chart.png',
	title:'Reports',
	window:win4
});

//create table view
var tableviewReports = Titanium.UI.createTableView({
	data:reportData
});

win4.add(tableviewReports);

//
//create help tab and root window
//
var win5 = Titanium.UI.createWindow({  
	url:'support.js',
	title:'Help',
	backgroundColor:'#fff'
});

var tab5 = Titanium.UI.createTab({  
	icon:'90-lifebuoy.png',
	title:'Help',
	window:win5
});


//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2); 
tabGroup.addTab(tab3);
tabGroup.addTab(tab4);
tabGroup.addTab(tab5);

var regAD = Titanium.UI.createAlertDialog({
	title:'RelayManager',
	message:'Would you like to register this app to receive email updates? We can promise that your personal information will not be shared with third parties.',
	buttonNames: ['Sign Me Up','No, Thanks']
});

regAD.addEventListener('click',function(e){
	if(e.index == 0){
		// start registration process
		var w = Ti.UI.createWindow({
			backgroundColor:'777777'
		});
		
		var invalidEmailAddressAlert = Titanium.UI.createAlertDialog({
			title:'Error',
			message:'The email address you provided was invalid. You will have an opportunity to re-register at a later time.'
		});
		
		var fnLabel = Ti.UI.createLabel({
			text : 'First Name',
			color : 'white',
			font : {fontSize:14,fontFamily:'Helvetica Neue'},
			top : 30,
			left : 35,
			width:'auto',
			height:'auto'
		});
		
		var firstNameTextField = Ti.UI.createTextField({
			height : 35,
			top : 55,
			left : 30,
			width : 240,
			//hintText : 'First Name',
			keyboardType : Ti.UI.KEYBOARD_DEFAULT,
			returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED
		});

		var lnLabel = Ti.UI.createLabel({
			text : 'Last Name',
			color : 'white',
			font : {fontSize:14,fontFamily:'Helvetica Neue'},
			top : 105,
			left : 35,
			width:'auto',
			height:'auto'
		});
		
		var lastNameTextField = Ti.UI.createTextField({
			height : 35,
			top : 130,
			left : 30,
			width : 240,
			//hintText : 'First Name',
			keyboardType : Ti.UI.KEYBOARD_DEFAULT,
			returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED
		});
		
		var emailLabel = Ti.UI.createLabel({
			text : 'Email Address',
			color : 'white',
			font : {fontSize:14,fontFamily:'Helvetica Neue'},
			top : 180,
			left : 35,
			width:'auto',
			height:'auto'
		});
		
		var emailTextField = Ti.UI.createTextField({
			height : 35,
			top : 205,
			left : 30,
			width : 240,
			//hintText : 'First Name',
			keyboardType : Ti.UI.KEYBOARD_EMAIL,
			returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			autocapitalization:Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE
		});

		// Listen for return events.
		// firstNameTextField.addEventListener('return', function(e) {
			// firstNameTextField.blur();
			// alert('Input was: ' + firstNameTextField.value);
		// });
		
		var b = Ti.UI.createButton({
			title:'Register',
			top:340,
			width:125,
			height:30
		});
		b.addEventListener('click',function()
		{
			// validate input
			var emailAddress = emailTextField.value;
			if(validateEmailAddress(emailAddress)){

				var xhrRegister = Titanium.Network.createHTTPClient();
				xhrRegister.onload = function(){
					Ti.API.info("onload function for createTeam");
					try{
						Ti.API.info(this.responseText);
						var doc = this.responseXML.documentElement;
						var elements = doc.getElementsByTagName("row");
						var myResponseKey = elements.item(0).text;  // this is the registration key from GAE
						if(myResponseKey.length > 4){
							dbMain.execute('UPDATE settings SET registration_status = 1 WHERE setting_id = 1');
						}
					}catch(e){
						Ti.API.info("b.addEventListener('click',function() error: "+e.error);
					}
				};
				var firstNameValue = firstNameTextField.value;
				if((firstNameValue == null) || (firstNameValue.length < 1)){
					var atpos=emailAddress.indexOf("@");
					firstNameValue = emailAddress.substring(0,atpos);
				}
				
				xhrRegister.open('POST','https://sinequanonsolutions.appspot.com/registration');
				var registrationData = {};
				registrationData.procid = "0";
				registrationData.sharedsecret= getSharedSecret();
				registrationData.firstName = firstNameValue;
				registrationData.lastName = lastNameTextField.value;
				registrationData.email = emailAddress;
				registrationData.deviceId = Ti.Platform.macaddress;
				if(Titanium.Network.online == 1){
					xhrRegister.send(registrationData);
				} else {
					noNetworkAlert.show();
				}
			}else{
				invalidEmailAddressAlert.show();
			}	
			w.close();
		});
		
		w.add(b);
		w.add(fnLabel);
		w.add(firstNameTextField);
		w.add(lnLabel);
		w.add(lastNameTextField);
		w.add(emailLabel);
		w.add(emailTextField);
		w.open({modal:true,modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,modalStyle:Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET,navBarHidden:true});

	}else{
		dbMain.execute('UPDATE settings SET registration_status = -1 WHERE setting_id = 1');
	}
});

// this is the main startup code
tabGroup.addEventListener('open',function(e){
	Ti.include('db_initialization.js');
	var regRow = dbMain.execute('SELECT registration_status FROM settings WHERE setting_id = 1');
	var regStatus = 1;
	if(regRow.isValidRow()){
		regStatus = regRow.field(0);
	}
	regRow.close();
	if(regStatus == 0){
		regAD.show();	
	}
});

//Ti.include('populate_race_table.js');
Ti.include('populate_agegroup_lk.js');
Ti.include('populate_set_lk.js');
Ti.include('date_functions.js');
Ti.include('countdown.js');

// open tab group
tabGroup.open();

function homescreenSetup(){

	
	try{
		var row = dbMain.execute('SELECT team_name,race_id FROM settings WHERE setting_id = 1');
		if(row.isValidRow()){
			var tn = row.field(0);
			var ri = row.field(1);
			if (tn != '-1'){
				labelTeamName.text = tn;
			} else {
				labelTeamName.text = 'Team Name Not Selected';
			}
			if (ri != '-1'){
				var qRow = dbMain.execute('SELECT race_name,race_date FROM race WHERE race_id = ?',ri);
				if (qRow.isValidRow()){
					raceName = qRow.field(0);
					raceDate = qRow.field(1);
					labelRaceName.text = raceName;
					//Ti.API.info("raceDate: "+raceDate.replace(/-/g,"/"));
					//var startDate = new Date(raceDate.replace(/-/g,"/"));
					var raceDateStr = getRaceDisplayDate(raceDate);
					labelRaceDate.text = raceDateStr;
					//labelRaceDate.text = startDate.toString('dddd, MMMM, yyyy');
					Titanium.App.Properties.setString('RaceName',raceName);
					Titanium.App.Properties.setInt('RaceId',ri);
					Titanium.App.Properties.setString('RaceDateStr',raceDateStr);
				}
				qRow.close();
			} else {
				labelRaceName.text = 'Race Not Selected';
				labelRaceDate.text = '(Go to Setup Tab to Complete)';
			}
		}else{
			labelTeamName.text = 'Team Name Not Selected';
			labelRaceName.text = 'Race Not Selected';
			labelRaceDate.text = '(Go to Setup tab to complete)';
		}
		row.close();
	}catch(ex){
		Ti.API.info('homescreenSetup() exception: '+ex);
	}
	win1.add(labelTeamName);
	win1.add(labelRaceName);
	win1.add(labelRaceDate);
	win1.add(versionNumber);
	
	var rst = getRaceStartTime();
	if(rst > 0){
		assignedStartTime = rst;
		win1.add(labelCountDown);
		countDownDisplay();	
	}

}




win1.addEventListener('focus',function(e){
	Ti.API.info('focus event, calling homescreenSetup');
	homescreenSetup();
});

//trap app shutdown event
Titanium.App.addEventListener('close',function(e)
{
	try{
		dbMain.close();
	}catch(ex){
		Ti.API.info('Shutdown exception: '+ex);
	}
	

});

