var teamKey_text = "";

if (Titanium.Network.online == 1){
	var row = dbMain.execute('SELECT team_key FROM team_identity WHERE team_id = 1');
	var teamKey = 'TEMP';
	if (row.isValidRow()){
		teamKey = row.field(0);
	}
	row.close();
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function(){
			Ti.API.info('onload function called');
			try{
				var xml = this.responseXML;
				var teamInfo = xml.documentElement.getElementsByTagName("row");
				var teamKey = teamInfo.item(0).getElementsByTagName("team_key");
			    teamKey_text = teamKey.item(0).text;
			    if(teamKey_text.length > 40){
			    	dbMain.execute('UPDATE team_identity SET team_key = ?, assigned_team_number = ? WHERE team_id = 1',teamKey_text,teamNumber);
			    }
				Ti.API.info('team key: '+teamKey_text);
				uploadRoster();
			}catch(e){
				Ti.API.info('upload_teaminfo: '+e.error);
			}
		};

	xhr.open('POST','http://sinequanonsolutions.appspot.com/teaminfo');
	var data = {};
	data.teamname = teamName;
	data.teamnumber = teamNumber;
	data.sharedsecret = ss;

	Ti.API.info('Getting ready to send team info to server');
	
	if((teamKey.length < 40) && (Titanium.Network.online == 1)){ // a valid team key has not been returned from the server
		data.procid = "0";
		xhr.send(data);
	} else {
		// pass the teamKey to update the team name
		data.teamkey = teamKey;
		data.procid = "1";
		if(Titanium.Network.online == 1){
			xhr.send(data);
		}
	}
} else {
	alert("You do not currently have a network connection. Try the update again after verifying that one has been established.");
}


