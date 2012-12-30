var win = Titanium.UI.currentWindow;
var dbMain;
var raceId = -1;
var rid;
var ss = '4dd912e8c4d73f1a5c7969685ec23038'; // should get from constants script
var teamName = "";
var teamNumber = "";
var teamPredictionKey = "";
var teamKey = "";
var actInd;
var vanId = 1;
var deviceId = 2;
var registrationStatus;
var hoSlave = '';

Ti.include('get_displaytime.js');
Ti.include('projections.js');
var sharingEnabledMsg = "";
win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';

var sharingLabel = Titanium.UI.createLabel({
	text:'Pressing the Enable Sharing button will upload information about your team to a secure server and will enable your device to upload results following each handoff. A few seconds after pressing the button you will receive a team token that can be shared with teammates that have a copy of this app or others wishing to track your progress on the web.',
	color:'#000066',
	//font:{fontSize:16},
	font:{fontSize:16, fontWeight:'bold'},
	textAlign:'left',
	top:20,
	left:25,
	right:25,
	height:'auto'
});
win.add(sharingLabel);

var labelSlaveTokenText = Ti.UI.createLabel({
	top: 210,
	color:'#fff',
	text:'Subordinate token: ',
	font:{fontSize:18,fontWeight:'bold'},
	width:'auto',
	height:'auto'
});

win.add(labelSlaveTokenText);
labelSlaveTokenText.hide();

var enableHandoffBtn = Titanium.UI.createButton({
	top:280,
	height:40,
	width:210,
	title: 'Enable Data Sharing',
	enabled:true
});

win.add(enableHandoffBtn);

enableHandoffBtn.addEventListener('click',function(e){
	if(isValid()){
		Ti.API.info('everything was valid');
		initiateUpload();
	}
});

var shareButton = Ti.UI.createButton({
	title:'Email Token',
	top:275, 
	height:40,
	width: 225
});
win.add(shareButton);
shareButton.hide();

shareButton.addEventListener('click',function()
{
	emailToken();
});


function initiateUpload(){
	var teamQuery = dbMain.execute("SELECT team_key,team_prediction_key FROM team_identity WHERE team_id = 1");
	if(teamQuery.isValidRow()){
		teamKey = teamQuery.field(0);
		teamPredictionKey = teamQuery.field(1);
	}
	var myTeamKey = teamKey;
	teamQuery.close();
	createTeam(); 

};

function createTeam(){
	enableHandoffBtn.hide();
	sharingLabel.text = "Your team is being registered with the server. We do not sell, trade or otherwise transfer your personally identifiable information to outside parties. See the disclosure document on the Help tab for more information.";
	var xhrTeam = Titanium.Network.createHTTPClient();
	xhrTeam.onload = function(){
		Ti.API.info("onload function for createTeam");
		try{
			Ti.API.info(this.responseText);
			var doc = this.responseXML.documentElement;
			var tk = doc.getElementsByTagName("team_key");
			var teamKey2 = tk.item(0).text;
			var tpk = doc.getElementsByTagName("team_prediction_key"); 
			teamPredictionKey = tpk.item(0).text;
			Ti.API.info("createTeam teamKey2: "+teamKey2);
			Ti.API.info("teamPredictionKey: "+teamPredictionKey);
			
			if(teamKey2.length > 20){
				dbMain.execute("UPDATE team_identity SET team_key = ?,team_prediction_key = ? WHERE team_id = 1",teamKey2,teamPredictionKey);
				Ti.API.info("team identity updated with team key and team prediction key");
				uploadRoster(teamKey2);
				//createHandoffEntity(teamKey2,teamPredictionKey);
			}
		}catch(e){
				Ti.API.info('createTeam Error: '+e.error);
		}
	};
	xhrTeam.open('POST','https://sinequanonsolutions.appspot.com/handoff');
	var teamData = {};
	teamData.procId = "3";
	teamData.ss = ss;
	teamData.teamName = teamName;
	teamData.raceId = raceId;
	if(Titanium.Network.online == 1){
		xhrTeam.send(teamData);
	} else {
		noNetworkAlert.show();
	}	
};

function createHandoffEntity(myTeamKey,myTeamPredictionKey){
		Ti.API.info("createHandoffEntity called");
		sharingLabel.text = "Your team token has been requested and should appear shortly.";

		// TODO: pass race id, team key to server
		// get slave and observer tokens back
		// update screen
		var xhr3 = Titanium.Network.createHTTPClient();
		xhr3.onload = function(){
			Ti.API.info("onload function for handoff button click event");
			try{
				Ti.API.info(this.responseText);
				var doc = this.responseXML.documentElement;
				var e1 = doc.getElementsByTagName("handoff_key");
				var handoffKey = e1.item(0).text;
				var e2 = doc.getElementsByTagName("primary_key");
				var primaryKey = e2.item(0).text;
				var e3 = doc.getElementsByTagName("secondary_key");
				var secondaryKey = e3.item(0).text;
				var e4 = doc.getElementsByTagName("observer_key");
				var observerKey = e4.item(0).text;
				//var e5 = doc.getElementsByTagName("team_key");
				//var tKey = e5.item(0).text;
				Ti.API.info("handoff key: "+handoffKey);
				Ti.API.info("primary key: "+primaryKey);
				Ti.API.info("secondary key: "+secondaryKey);
				Ti.API.info("observer key: "+observerKey);
				//Ti.API.info("team key: "+tKey);
				
				//TODO: update the handoff record and then display the tokens
				// the local table should store the tokens, the handoff key, the role (e.g. primary) and the van assignment
				if(handoffKey.length > 40){
					// setting device id = 1 indicates that this is the master device
					dbMain.execute("UPDATE handoff_status SET active = 1, device_id = 1, handoff_key = ?, slave_token = ?, spectator_token = ? WHERE handoff_id = 1",handoffKey,secondaryKey,observerKey);
					//dbMain.execute("UPDATE team_identity SET team_key = ? WHERE team_id = 1",tKey);
					Ti.API.info('sharing status enabled');
					enableHandoffBtn.hide();
		
					labelSlaveTokenText.top = 210;
					sharingLabel.text = sharingEnabledMsg; 
					labelSlaveTokenText.text = "Team token: "+secondaryKey;
					labelSlaveTokenText.show();
					shareButton.show();
					win.backButtonTitle = 'Return';
					sendProjections(myTeamPredictionKey);
					Ti.API.info("projections sent");
				} else {
					// show problem alert
					problemAlert.show();
				}

			}catch(e){
				Ti.API.info('createHandoffEntity Error: '+e.error);
			}
		};
		xhr3.open('POST','https://sinequanonsolutions.appspot.com/handoff');
		var handoffData = {};
		handoffData.procId = "0";
		handoffData.raceId = rid;
		//handoffData.vanId = -1;
		Ti.API.info("handoff data race id: "+rid);
		handoffData.ss = ss;
		handoffData.teamKey = myTeamKey; 
		handoffData.teamName = teamName;
		Ti.API.info("handoff data team key: "+teamKey);
		if(Titanium.Network.online == 1){
			xhr3.send(handoffData);
		} else {
			noNetworkAlert.show();
		}			

};

var problemAlert = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'There was a problem pairing this device. Please contact support.'
});

var enabledAlert = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Device handoff has been successfully enabled.'
});

var noNetworkAlert = Titanium.UI.createAlertDialog({
	title:'Error',
	message:'You do not currently have a network connection. Please try again later.'
});

var invalidSKAlert = Titanium.UI.createAlertDialog({
	title:'Error',
	message:'You have entered an invalid subordinate token. Please try again.'
});

// this function has been copied from enable_tracking
// TODO: refactor
function uploadRoster(myTeamKey){
	Ti.API.info('starting uploadRoster');
	sharingLabel.text = "Your roster is now being uploaded.";

	Ti.API.info("myTeamKey: "+myTeamKey);
	var payLoad = '{"Roster":{"raceId":"'+raceId+'","teamKey":"'+myTeamKey+'","runners":[';
	//var payLoad = '{"Roster":{"raceId":"'+raceId+'","runners":[';
	try{
		var counter = 0;
		var row3 = dbMain.execute('SELECT first_name,last_name,set_id,ten_k_speed,miles_per_week,agegroup_id FROM runner ORDER BY set_id');
		while (row3.isValidRow()){
			counter++;
			firstName = row3.field(0);
			lastName = row3.field(1);
			setId = row3.field(2);
			tenKSpeed = row3.field(3);
			mpw = row3.field(4);
			agId = row3.field(5); // age group id
			agId = (agId == null) ? '-1' : agId;

			payLoad += '{"runner":"'+setId+'"';
			payLoad += ',"firstName":"'+firstName+'"';
			payLoad += ',"lastName":"'+lastName+'"';
			payLoad += ',"tenKSpeed":"'+tenKSpeed+'"';
			payLoad += ',"milesPerWeek":"'+mpw+'"';
			payLoad += ',"ageId":"'+agId+'"}';
			if(counter < 12){
				payLoad +=',';
			}

			row3.next();
		}
        row3.close();
		
	}catch(ex){
		Ti.API.info('Error: unable to upload team roster');
	}finally{
		payLoad += ']}}';
	}
	Ti.API.info('getting ready to create http client');
	var xhrEnableSharing = Titanium.Network.createHTTPClient();
	xhrEnableSharing.onload = function(){
			Ti.API.info('onload function called for upload roster');
			try{
				Ti.API.info(this.responseText);
				var doc = this.responseXML.documentElement;
				var elements = doc.getElementsByTagName("row");
				var myTpKey = elements.item(0).text;
				Ti.API.info("reqStatus (tpk): "+myTpKey);
				if(myTpKey.length > 40){ // change this to 40
					//dbMain.execute("UPDATE team_identity SET team_prediction_key = ?, tracking_enabled = 1 WHERE team_id = 1",myTpKey);	
					Ti.API.info("A valid team prediction key was just returned from uploading the roster.");
				}
				createHandoffEntity(myTeamKey,myTpKey);
				//label0.text = "Web tracking was successfully enabled (you can go to the Help tab to for information about this feature). Press Return to get back to the Setup menu.";
			}catch(e){
				//label0.text = "There was an error in enabling web tracking. Try again later and notify support (see Help tab) if the problem persists.";
				Ti.API.info('upLoad Roster Error: '+e.error);
			}finally{
				//actInd.hide();
			}
		};
	xhrEnableSharing.open('POST','https://sinequanonsolutions.appspot.com/roster');
	var data = {};
	data.procid = "0";
	data.raceId = raceId;
	data.sharedsecret = ss;
	data.payload = payLoad;
	data.teamKey = myTeamKey;
	Ti.API.info("sent myTeamKey: "+myTeamKey);
	// don't upload if network is offline
	if(Titanium.Network.online == 1){
		xhrEnableSharing.send(data);
		Ti.API.info('upload roster data sent');
	} else {
		b.message = 'You do not appear to have a network connection. Please try again later.';
		b.show();
	}
	win.backButtonTitle = 'Return';

}


var raceName = '';
var errorMsg = 'You have not yet completed all of the steps in Prepare for Race Start. Return to the Setup menu and complete those steps before proceeding.';

var notReadyAlert = Ti.UI.createAlertDialog({
	title:'Relay Manager',
	message:'This device is not yet registered.'
});

//need a function to check that the team start time has been set

function isValid(){
	// different validation if selection is slave
	var alertMsg = 'The following errors were detected: ';
	
	var validationMessage = '';
	//var teamKey = 0;
	//var raceId = 0;
	var assignmentCount = 0;
	var validFlag = true;
	
	rid = raceId;

	// check to make sure the raceId is valid
	if(raceId === 0){
		validFlag = false;
		alertMsg += '- race not selected ';
	}

	var assignmentCountRow = dbMain.execute('SELECT COUNT(*) FROM set_assignment WHERE race_id = ?',raceId);
	if(assignmentCountRow.isValidRow()){
		assignmentCount = assignmentCountRow.field(0);
	}
	assignmentCountRow.close();
	Ti.API.info('assignmentCount: '+assignmentCount);
	// check to make sure that there are twelve runners assigned to 36 legs
	if(assignmentCount !== 12){
		validFlag = false;
		alertMsg += '- runners not assigned to legs ';
	}

	if(validFlag === false){
		notReadyAlert.message = alertMsg;
		notReadyAlert.show();
	}
	return validFlag;
}


var b = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Action cancelled. Handoff was not enabled.'
});

var a = Titanium.UI.createAlertDialog({
	title:'Caution!',
	message:'This action may take several minutes to complete during which time you must maintain an internet connection. Are you sure you want to enable tracking for the selected race?',
	buttonNames: ['Yes','No']
});


a.addEventListener('click', function(e){
	actInd = Titanium.UI.createActivityIndicator({ bottom:200, height:50, width:10, style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN });
	actInd.style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN;
	actInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
	actInd.color = 'white';
	//actInd.message = 'Updating Leg Distances...';
	actInd.width = 210;
	actInd.show();
	win.add(actInd);
	enableHandoffBtn.hide();

	// first obtain a team key and update settings table
	if((teamName.length > 0) && (teamNumber.length > 0)){
		Ti.include('upload_teaminfo.js');
	} else {
		alert("Error: your team name and assigned team number cannot be blank. Please correct and try again.");
	}

});



// this is the main startup code
win.addEventListener('focus',function(e){
	var hoActive = 0;
	var hoKey = "-1";
	hoSlave = "";
	dbMain = Titanium.Database.open('main');
	var handoffStatus = dbMain.execute('SELECT active, handoff_key, slave_token FROM handoff_status WHERE handoff_id = 1');
	if(handoffStatus.isValidRow()){
		hoActive = handoffStatus.field(0);
		hoKey = handoffStatus.field(1);
		hoSlave = handoffStatus.field(2);
		Ti.API.info('active: '+hoActive);
		Ti.API.info('handoffkey: '+hoKey);
	}
	handoffStatus.close();
	var row4 = dbMain.execute('SELECT race_id,registration_status,team_name FROM settings WHERE setting_id = 1');
	if(row4.isValidRow()){
		raceId = row4.field(0);
		registrationStatus = row4.field(1);
		teamName = row4.field(2);
	}
	row4.close();
	Ti.API.info('raceId: '+raceId);

	sharingEnabledMsg = "Data sharing has been enabled for "+teamName+". The team token can be given to teammates who have this app or to those who wish to track your progress on the web (that application can be found at http://goo.gl/dERnx).";

	if(hoActive === 1){
		labelSlaveTokenText.top = 200;
		enableHandoffBtn.hide();
		if(hoSlave.length > 4){
			sharingLabel.text = sharingEnabledMsg;
			labelSlaveTokenText.text = "Team token: "+hoSlave;
			labelSlaveTokenText.show();
			shareButton.show();
		}else{
			sharingLabel.text = "Data sharing was enabled for this device by entering the team token. You can cancel data sharing by selecting Disable Data Sharing from the Setup menu.";
		}
	} else {
		deviceId = 2;
		hoVan = 0;
		win.add(sharingLabel);
		win.add(enableHandoffBtn);
		Ti.API.info("handoff inactive, button should appear");
	}
});

function emailToken(){
	var teamName;
	var rowTN = dbMain.execute('SELECT team_name,race_id FROM settings WHERE setting_id = 1');
	if(rowTN.isValidRow()){
		var teamName = rowTN.field(0);
	}
	rowTN.close();
	var rowTT = dbMain.execute('SELECT slave_token FROM handoff_status WHERE handoff_id = 1');
	if(rowTT.isValidRow()){
		hoSlave = rowTT.field(0);
	}
	rowTT.close();
	
	var emailDialog02 = Titanium.UI.createEmailDialog();
	if (!emailDialog02.isSupported()) {
		Ti.UI.createAlertDialog({
			title:'Error',
			message:'Email not available'
		}).show();
		return;
	}
	emailDialog02.setSubject('Relay Manager Team Token');
	emailDialog02.html = true;
	emailDialog02.messageBody = 'The team token for '+teamName+' is<p><b>'+hoSlave+'</b><p> You can use this token to follow the team on the web (http://goo.gl/dERnx) or with the <a href="http://itunes.apple.com/us/app/relay-manager/id378080198?mt=8">Relay Manager iOS app</a>.';
	//var f = Ti.Filesystem.getFile(fileName);
	//emailDialog02.addAttachment(myFile);
	//emailDialog02.setToRecipients(['support@sinequanonsolutions.com']);
	emailDialog02.addEventListener('complete',function(e)
	{
		if (e.result == emailDialog02.SENT)
		{
			if (Ti.Platform.osname != 'android') {
				// android doesn't give us useful result codes.
				alert("Your message has been sent.");
			}
		}
		else
		{
			alert("Your message was not sent.");
		}
	});
	emailDialog02.open();
};
