var win = Titanium.UI.currentWindow;

Ti.include('biz_logic.js');
var dbMain;
var raceId = -1;
var ss = '4dd912e8c4d73f1a5c7969685ec23038'; // should get from constants script

win.backgroundImage = 'gradientBackground.png';

win.backButtonTitle = 'Cancel';
win.hideTabBar();

var updateDistancesBtn = Titanium.UI.createButton({
	top:240,
	height:40,
	width:210,
	title: 'Update Distances',
	enabled:true
});

updateDistancesBtn.addEventListener('click',function(e){
	a.show();
});


var raceName = '';
var errorMsg = 'You have not yet selected a race. Return to the Setup menu and complete that step before proceeding';

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
	try{
		dbMain = Titanium.Database.open('main');
		var row = dbMain.execute('SELECT race_id FROM settings WHERE setting_id = 1');
		if(row.isValidRow()){
			raceId = row.field(0);
			if (raceId != '-1'){
				var qRow = dbMain.execute('SELECT race_name FROM race WHERE race_id = ?',raceId);
				if (qRow.isValidRow()){
					raceName = qRow.field(0);
					label0.text = 'Pressing the Update Distances button below will add or update distances for '+raceName+'. You will need a connection to the internet to proceed. Press Cancel to return to the previous screen or press Update Distances to proceed.';
					Titanium.App.Properties.setInt('RaceId',raceId);
					win.add(updateDistancesBtn);
				}
				qRow.close();
			} else {
				label0.text = errorMsg;
			}
		}else{
			label0.text = errorMsg;
		}
		row.close();
	}catch(ex){
		Ti.API.info('update_distance homescreenSetup() exception: '+ex);
	}
}

win.add(label0);

var b = Titanium.UI.createAlertDialog({
	title:'Relay Manager',
	message:'Action cancelled. Distances were not updated.'
});

var a = Titanium.UI.createAlertDialog({
	title:'Caution!',
	message:'This update may take several minutes to complete during which time you must maintain an internet connection. Are you sure you want to update distances for the selected race?',
	buttonNames: ['Yes','No']
});

a.addEventListener('click', function(e){
	if (e.index == 0){
		var crid = getRaceId();
		if(Titanium.Network.online == 1){
			rowCount = 0;
			rCount = dbMain.execute('SELECT COUNT(*) FROM race_leg WHERE race_id = ?',raceId);
			if(rCount.isValidRow()){
				rowCount = rCount.field(0);	
			}
			rCount.close();
	
			//label0.hide();	
			updateDistancesBtn.hide();
			var actInd = Titanium.UI.createActivityIndicator({ bottom:200, height:50, width:10, style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN });
			actInd.style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN;
			actInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
			actInd.color = 'white';
			//actInd.message = 'Updating Leg Distances...';
			actInd.width = 210;
			actInd.show();
			win.add(actInd);
			
			var xhr = Titanium.Network.createHTTPClient();
			xhr.onload = function(){
				Ti.API.info('update distance onload function called');
				Ti.API.info('xml: ' + this.responseXML + ' text ' + this.responseText);
				try{
					var doc = this.responseXML.documentElement;
					var elements = doc.getElementsByTagName("sql");
					var nrid = getRaceId();
					if(nrid == crid){
						dbMain.execute('DELETE FROM race_leg WHERE race_id = ?',nrid);
					}
					for(var i=0; i<elements.length; i++){
						var sql = elements.item(i).text;
						Ti.API.info("sql: "+sql);
						dbMain.execute(sql);
					}
					label0.text = "The leg distances for the "+raceName+" were successfully updated. Press Return to get back to the Setup menu.";
				}catch(e){
					label0.text = "There was an error in updating the leg distances. Try again later and notify support (see Help tab) if the problem persists.";
					Ti.API.info('update_distance event handler: '+e.error);
				}finally{
					actInd.hide();
				}
			};
	
			xhr.open('POST','http://sinequanonsolutions.appspot.com/distance');
			var data = {};
			data.procid = "0";
			data.raceId = raceId;
			data.rowCount = rowCount;
			data.sharedsecret = ss;
			if(Titanium.Network.online == 1){
				xhr.send(data);
			}
			win.backButtonTitle = 'Return';
		} else {
			b.message = 'Action cancelled. Distances were not updated.';
			b.show();
		}
		
	} else {
		alert("You do not currently have a network connection. Try the update again after verifying that one has been established.");
	}
});


// this is the main startup code
win.addEventListener('open',function(e){
	homescreenSetup();
});
