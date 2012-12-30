	Ti.API.info('fired open event');
	try{
		var teamName = Ti.App.Properties.getString('TeamName');
		if (teamName == null){
			Ti.App.Properties.setString('TeamName','-1');
		}
		var teamNumber = Ti.App.Properties.getString('TeamNumber');
		if(teamNumber == null){
				Ti.App.Properties.setString('TeamNumber','-1');
		}
		var assignedStart = Ti.App.Properties.getString('AssignedTeamStart');
		if (assignedStart == null){
			Ti.App.Properties.setString('AssignedTeamStart','12:00'); // noon
		}
		var setId = Titanium.App.Properties.getInt('SetId');
		if(setId == null){
			Titanium.App.Properties.setInt('SetId',-1);
		}
		var agId = Titanium.App.Properties.getInt('AgeGroupId');
		if(agId == null){
			Titanium.App.Properties.setInt('AgeGroupId',-1);
		}
		var raceId = Titanium.App.Properties.getInt('RaceId');
		if(raceId == null){
			Titanium.App.Properties.setInt('RaceId',-1);
		}
		var startOfRelay = Titanium.App.Properties.getDouble('StartOfRelay');
		if(startOfRelay == null){
			Titanium.App.Properties.setDouble('StartOfRelay',-1);
		}
		var startOfLeg = Titanium.App.Properties.getDouble('StartOfLeg');
		if(startOfLeg == null){
			Titanium.App.Properties.setDouble('StartOfLeg',-1);
		}	var endOfRelay = Titanium.App.Properties.getDouble('EndOfRelay');
		if(endOfRelay == null){
			Titanium.App.Properties.setDouble('EndOfRelay',-1);
		}
		var currentLeg = Titanium.App.Properties.getInt('CurrentLeg');
		if(currentLeg == null){
			Titanium.App.Properties.setInt('CurrentLeg',-1);
		}
		var currentRunnerId = Titanium.App.Properties.getInt('CurrentRunnerId');
		if(currentRunnerId == null){
			Titanium.App.Properties.setInt('CurrentRunnerId',-1);
		}
	
		dbMain = Titanium.Database.open('main');
		dbMain.execute('CREATE TABLE IF NOT EXISTS race(race_id INTEGER PRIMARY KEY, race_name TEXT, race_date TEXT, sunset TEXT, sunrise TEXT, moonrise TEXT, moonset TEXT, moon_illum INTEGER DEFAULT 0)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS relay_results(race_id INTEGER, leg_id INTEGER, leg_start DOUBLE, leg_end DOUBLE)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS runner(runner_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, ten_k_speed REAL, miles_per_week INTEGER, agegroup_id INTEGER, set_id INTEGER, second_set_id INTEGER, assignment_id INTEGER)');
		//dbMain.execute('ALTER TABLE runner ADD COLUMN agegroup_id INTEGER');
		dbMain.execute('CREATE TABLE IF NOT EXISTS agegroup_lk(agegroup_id INTEGER PRIMARY KEY, desc TEXT)');
		//dbMain.execute('DROP TABLE set_lk');
		dbMain.execute('CREATE TABLE IF NOT EXISTS set_lk(set_id INTEGER PRIMARY KEY, desc TEXT)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS set_assignment(race_id INTEGER, runner_id INTEGER, set_id INTEGER)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS settings(setting_id INTEGER PRIMARY KEY,registration_status INTEGER DEFAULT 0,ready_to_start INTEGER DEFAULT 0,team_name TEXT, team_number TEXT, assigned_team_start TEXT, current_set_id INTEGER, current_agegroup_id INTEGER, race_id INTEGER DEFAULT -1, start_of_relay DOUBLE, start_of_leg DOUBLE, end_of_relay DOUBLE, current_leg INTEGER DEFAULT -1, current_runner_id INTEGER)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS race_leg(leg_id INTEGER PRIMARY KEY,race_id INTEGER,leg_number INTEGER,van_number INTEGER,set_number INTEGER,distance REAL,rating_id INTEGER,elev_gain INTEGER,elev_loss INTEGER,start_lat REAL,start_lon REAL,end_lat REAL,end_lon REAL,desc TEXT,notes TEXT,url TEXT,image TEXT,other TEXT)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS team_identity(team_id INTEGER PRIMARY KEY,team_key TEXT, race_id INTEGER, assigned_team_number TEXT, division_id INTEGER, team_prediction_key TEXT, tracking_enabled INTEGER DEFAULT 0)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS send_status(leg_number INTEGER, completed INTEGER DEFAULT 0, sent INTEGER DEFAULT 0, received INTEGER DEFAULT 0)');
		dbMain.execute('CREATE TABLE IF NOT EXISTS handoff_status(handoff_id INTEGER, active INTEGER DEFAULT 0, device_id INTEGER DEFAULT 0, van_id INTEGER DEFAULT 0, handoff_key TEXT, slave_token TEXT, spectator_token TEXT, timekeeper INTEGER DEFAULT 1,listen INTEGER DEFAULT 0)');

		// status 1 = recorded, status 2 = send confirmed, status 3 = network receipt 
		dbMain.execute('CREATE TABLE IF NOT EXISTS network_status(network_id INTEGER PRIMARY KEY, last_heartbeat DOUBLE DEFAULT 0, untransmitted_data INTEGER DEFAULT 0, s_s INTEGER DEFAULT 0, s_1 INTEGER DEFAULT 0, s_2 INTEGER DEFAULT 0, s_3 INTEGER DEFAULT 0, s_4 INTEGER DEFAULT 0, s_5 INTEGER DEFAULT 0, s_6 INTEGER DEFAULT 0, s_7 INTEGER DEFAULT 0, s_8 INTEGER DEFAULT 0, s_9 INTEGER DEFAULT 0, s_10 INTEGER DEFAULT 0, s_11 INTEGER DEFAULT 0, s_12 INTEGER DEFAULT 0, s_13 INTEGER DEFAULT 0, s_14 INTEGER DEFAULT 0, s_15 INTEGER DEFAULT 0, s_16 INTEGER DEFAULT 0, s_17 INTEGER DEFAULT 0, s_18 INTEGER DEFAULT 0, s_19 INTEGER DEFAULT 0, s_20 INTEGER DEFAULT 0, s_21 INTEGER DEFAULT 0, s_22 INTEGER DEFAULT 0, s_23 INTEGER DEFAULT 0, s_24 INTEGER DEFAULT 0, s_25 INTEGER DEFAULT 0, s_26 INTEGER DEFAULT 0, s_27 INTEGER DEFAULT 0, s_28 INTEGER DEFAULT 0, s_29 INTEGER DEFAULT 0, s_30 INTEGER DEFAULT 0, s_31 INTEGER DEFAULT 0, s_32 INTEGER DEFAULT 0, s_33 INTEGER DEFAULT 0, s_34 INTEGER DEFAULT 0, s_35 INTEGER DEFAULT 0, s_36 INTEGER DEFAULT 0)');
		
		//TODO: create table to hold prediction factors
		//TODO: check the last update on that table and requery the database if
		// it's been more than 1 hour
		dbMain.execute('CREATE TABLE IF NOT EXISTS prediction_factors(pf_id INTEGER PRIMARY KEY,avg_mileage_factor NUMERIC(5,10), dist_factor NUMERIC(5,10), elev_gain_factor NUMERIC(5,10), elev_loss_factor NUMERIC(5,10), rspeed_factor NUMERIC(5,10), set_factor NUMERIC(5,10), y_intercept NUMERIC(5,10), last_update DOUBLE)');
		var lastUpdate = 1;
		if(tableRowCount('network_status') == 0){
			dbMain.execute('INSERT INTO network_status(network_id,untransmitted_data) VALUES(1,0)');
		}
		
		if(tableRowCount('handoff_status') == 0){
			dbMain.execute('INSERT INTO handoff_status(handoff_id,slave_token,spectator_token) VALUES (?,?,?)','1','N/A','N/A');
		}
		
		if(tableRowCount('prediction_factors') == 0){
			dbMain.execute('INSERT INTO prediction_factors(pf_id,avg_mileage_factor, dist_factor, elev_gain_factor, elev_loss_factor, rspeed_factor, set_factor, y_intercept, last_update) VALUES(?,?,?,?,?,?,?,?,?)','1','-3.215535531','-293.6140072','84.2525025','-0.14229978','0.561003301','499.2522427','2092.752489','1');
		} else {
			row = dbMain.execute('SELECT last_update FROM prediction_factors WHERE pf_id = 1');
			if(row.isValidRow()){
				lastUpdate = row.field(0);
			}
			row.close();
		}
		var now = new Date();
		var currentTime = now.getTime(); 
		var compTime = lastUpdate + 3600000; // last update plus an hour
		if(currentTime > compTime){ // query the web service for more up-to-date prediction factors
			ss = '4dd912e8c4d73f1a5c7969685ec23038'; // shared secret
			var xhr = Titanium.Network.createHTTPClient();
			xhr.onload = function(){
				try{
					var xml = this.responseXML;
					var pfInfo = xml.documentElement.getElementsByTagName("row");
					var awmf = pfInfo.item(0).getElementsByTagName("awmf");
					var df = pfInfo.item(0).getElementsByTagName("df");
					var egf = pfInfo.item(0).getElementsByTagName("egf");
					var elf = pfInfo.item(0).getElementsByTagName("elf");
					var rsf = pfInfo.item(0).getElementsByTagName("rsf");
					var sf = pfInfo.item(0).getElementsByTagName("sf");
					var yi = pfInfo.item(0).getElementsByTagName("yi");
					
					if(pfInfo){ // if results are valid, update the table
						dbMain.execute("UPDATE prediction_factors SET avg_mileage_factor = ?, dist_factor = ?, elev_gain_factor = ?, elev_loss_factor = ?, rspeed_factor = ?, set_factor = ?, y_intercept = ?, last_update = ? WHERE pf_id = 1",awmf.item(0).text,df.item(0).text,egf.item(0).text,elf.item(0).text,rsf.item(0).text,sf.item(0).text,yi.item(0).text,currentTime);
					}
				}catch(ex){
					Ti.API.info('update prediction factors exception: '+ex);
				}
			};
			xhr.open('POST','http://sinequanonsolutions.appspot.com/factors');
			var data = {};
			data.procid = "1";
			data.sharedsecret = ss;
			if(Titanium.Network.online == 1){
				xhr.send(data);
			}
		}
		
		//Ti.include('test_runner.js'); // comment this line out before distributing, this is only for test setup
		//dbMain.execute('DELETE FROM set_lk');
		if(tableRowCount('team_identity') == 0){
			dbMain.execute('INSERT INTO team_identity(team_id,team_key) VALUES(?,?)','1','TEMP');
		}
		
		if(tableRowCount('settings') == 0){
			dbMain.execute('INSERT INTO settings(team_name) VALUES(?)','-1');
		} else {
			var row = dbMain.execute('SELECT team_name,team_number,assigned_team_start,current_set_id,current_agegroup_id,race_id,start_of_relay,start_of_leg,end_of_relay,current_leg,current_runner_id,registration_status FROM settings WHERE setting_id = 1');
			if (row.isValidRow()){
				var tn = row.field(0);
				var tb = row.field(1); // team number
				var as = row.field(2);
				var si = row.field(3);
				var ag = row.field(4);
				var ri = row.field(5); // race id
				var sr = row.field(6);
				var sl = row.field(7);
				var er = row.field(8);
				var cl = row.field(9);
				var cr = row.field(10);
				var rs = row.field(11);
				var teamName = (tn == null) ? '-1' : tn;
					Ti.App.Properties.setString('TeamName','-1');
				var teamNumber = (tb == null) ? '-1' : tb;
						Ti.App.Properties.setString('TeamNumber','-1');
				var assignedStart = (as == null) ? '-1' : as;
					Ti.App.Properties.setString('AssignedTeamStart','12:00'); // noon
				var setId = (si == null) ? '-1' : si;
					Titanium.App.Properties.setInt('SetId',-1);
				var agId = (ag == null) ? '-1' : ag;
					Titanium.App.Properties.setInt('AgeGroupId',-1);
				var raceId = (ri == null) ? '-1' : ri;
					Titanium.App.Properties.setInt('RaceId',-1);
				var startOfRelay = (sr == null) ? '-1' : sr;
					Titanium.App.Properties.setDouble('StartOfRelay',-1);
				var startOfLeg = (sl == null) ? '-1' : sl;
					Titanium.App.Properties.setDouble('StartOfLeg',-1);
				var endOfRelay = (er == null) ? '-1' : er;
					Titanium.App.Properties.setDouble('EndOfRelay',-1);
				var currentLeg = (cl == null) ? '-1' : cl;
					Titanium.App.Properties.setInt('CurrentLeg',-1);
				var currentRunnerId = (cr == null) ? '-1' : cr;
					Titanium.App.Properties.setInt('CurrentRunnerId',-1);
					
				if (rs == 999){ // these are the registration buttons
					win1.add(tf1);
					win1.add(tf2);
					win1.add(tf3);
					win1.add(registerBtn);
					win1.add(skipBtn);
				} else {
					win1.add(labelTeamName);
					win1.add(labelRaceName);
					win1.add(labelRaceDate);
				}
	
			}
			row.close();
		}
		if(tableRowCount('agegroup_lk') == 0){
			populateAgegroupLookup();
		}
		if(tableRowCount('set_lk') == 0){
			populateSetLookup();
		}
//		if(tableRowCount('race') == 0){
//			populateRaceTable();
//		}
//		if(tableRowCount('race') == 15){
			//Ti.include('populate_race_table2.js');
			//populateRaceTable2();
//		}
		
		//if(tableRowCount('race_leg') == 0){
		//	Ti.include('populate_leg_table.js');
		//}
	
	}catch(ex){
		Ti.API.info('Application setup exception thrown: '+ex);
	}
