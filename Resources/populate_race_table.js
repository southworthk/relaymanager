function populateRaceTable(){
	Ti.API.info('populateRaceTable called');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Del Sol','2011-02-25');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay New England','2011-05-20'); //estimate
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Florida Central','2010-11-19');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Florida Keys','2011-01-07');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Las Vegas','2010-10-22'); // raceId: 5
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay New York','2011-05-13'); //estimate
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Southern California','2011-04-22'); //estimate
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Tennessee','2010-11-05');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Wasatch Back','2010-06-18');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Northwest Passage','2010-06-23'); // raceId: 10
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Washington D.C.','2010-09-24');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Ragnar Relay Great River','2010-08-20');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','The Mass Dash','2010-07-17');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Hood to Coast','2010-08-13');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','RedRock Relay','2010-09-10'); // raceId: 15
/*	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Spokane to Sandpoint','2010-08-13'); // raceId: 16
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Wild West Relay','2010-08-06');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Cache-Teton Relay','2010-08-06');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Reach the Beach Relay','2010-09-17');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Blue Ridge Relay','2010-09-17');
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','Southern Odyssey Relay','2010-10-08'); // raceId: 21
	dbMain.execute('INSERT INTO race(race_name,race_date) VALUES(?,?)','The Bourbon Chase','2010-10-22');
*/
	var raceCount = tableRowCount('race');
	Ti.API.info('race table populated (count): '+raceCount);
}
