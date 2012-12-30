var win = Titanium.UI.currentWindow;
var dbMain;
var raceId = -1;
var ss = '4dd912e8c4d73f1a5c7969685ec23038'; // should get from constants script
var teamName = "";
var teamNumber = "";
var actInd;


win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';
win.hideTabBar();

var enableTrackingBtn = Titanium.UI.createButton({
	top:240,
	height:40,
	width:210,
	title: 'Enable Tracking',
	enabled:true
});

enableTrackingBtn.addEventListener('click',function(e){
	a.show();
});


var raceName = '';
var errorMsg = 'You have not yet completed all of the steps in Prepare for Race Start. Return to the Setup menu and complete those steps before proceeding.';

//need a function to check that the team start time has been set
var label0 = Ti.UI.createLabel({
	//text:'Pressing the Update Distances button below will add or update distances for the selected race. You will need a connection to the internet to proceed. Press cancel to return to the previous screen or press Update Distances to proceed.',
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

function homescreenSetup(){
	var assignmentCount = 0;
	try{
		dbMain = Titanium.Database.open('main');
		var row1 = dbMain.execute('SELECT race_id,team_name,team_number FROM settings WHERE setting_id = 1');
		if(row1.isValidRow()){
			raceId = row1.field(0);
			teamName = row1.field(1);
			teamNumber = row1.field(2);
		}
		row1.close();
		Ti.API.info("raceId: "+raceId);
		var row2 = dbMain.execute('SELECT COUNT(*) FROM set_assignment WHERE race_id = ?',raceId);
		if(row2.isValidRow()){
			assignmentCount = row2.field(0);
		}
		Ti.API.info("assignmentCount: "+assignmentCount);
		row2.close();
		if (assignmentCount != 12){
			label0.text = errorMsg;
		} else {
			label0.text = 'Pressing the Enable Tracking button will allow others to see the progress of your team during your selected race. You will need an internet connection to proceed as information about your team will be sent to the server. Press Cancel to return to the previous screen or press Enable Tracking to proceed.'; 
			win.add(enableTrackingBtn);
		}
	}catch(ex){
		Ti.API.info('homescreenSetup() exception: '+ex);
	}
}

win.add(label0);

var b = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Action cancelled. Tracking was not enabled.'
});

var a = Titanium.UI.createAlertDialog({
	title:'Caution!',
	message:'This action may take several minutes to complete during which time you must maintain an internet connection. Are you sure you want to enable tracking for the selected race?',
	buttonNames: ['Yes','No']
});

function uploadRoster(){
	var checkStatus = dbMain.execute('SELECT team_prediction_key,tracking_enabled FROM team_identity WHERE team_id = 1');
	var tpk = -1;
	var te = 0;
	if(checkStatus.isValidRow()){
		tpk = checkStatus.field(0);
		te = checkStatus.field(1);
	}
	checkStatus.close();

	// send a list of the runners to the server
	if ((teamKey_text.length > 40) && (tpk == -1) && (te == 0)){
		
		var payLoad = '{"Roster":{"raceId":"'+raceId+'","teamKey":"'+teamKey_text+'","runners":[';
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
			Ti.API.info('Error: unable to upload team roster'+e.error);
		}finally{
			payLoad += ']}}';
		}
		var xhrUploadRoster = Titanium.Network.createHTTPClient();
		xhrUploadRoster.onload = function(){
				Ti.API.info('onload function called');
				try{
					Ti.API.info(this.responseText);
					var doc = this.responseXML.documentElement;
					var elements = doc.getElementsByTagName("row");
					var reqStatus = elements.item(0).text;
					if(reqStatus.length > 40){ // change this to 40
						dbMain.execute("UPDATE team_identity SET team_prediction_key = ?, tracking_enabled = 1 WHERE team_id = 1",reqStatus);	
					}
					Ti.API.info("reqStatus: " + reqStatus);

					label0.text = "Web tracking was successfully enabled (you can go to the Help tab to for information about this feature). Press Return to get back to the Setup menu.";
				}catch(e){
					label0.text = "There was an error in enabling web tracking. Try again later and notify support (see Help tab) if the problem persists.";
					Ti.API.info('Enabling web tracking error: '+e.error);
				}finally{
					actInd.hide();
				}
			};
		xhrUploadRoster.open('POST','http://sinequanonsolutions.appspot.com/roster');
		var data = {};
		data.procid = "0";
		data.raceId = raceId;
		data.sharedsecret = ss;
		data.payload = payLoad;
		// don't upload if network is offline
		if(Titanium.Network.online == 1){
			xhrUploadRoster.send(data);
		} else {
			b.message = 'You do not appear to have a network connection. Please try again later.';
			b.show();
		}
		win.backButtonTitle = 'Return';
	}

}

a.addEventListener('click', function(e){
	actInd = Titanium.UI.createActivityIndicator({ bottom:200, height:50, width:10, style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN });
	actInd.style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN;
	actInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
	actInd.color = 'white';
	//actInd.message = 'Updating Leg Distances...';
	actInd.width = 210;
	actInd.show();
	win.add(actInd);
	enableTrackingBtn.hide();

	// first obtain a team key and update settings table
	if((teamName.length > 0) && (teamNumber.length > 0)){
		Ti.include('upload_teaminfo.js');
	} else {
		alert("Error: your team name and assigned team number cannot be blank. Please correct and try again.");
	}

});


// this is the main startup code
win.addEventListener('open',function(e){
	homescreenSetup();
});

