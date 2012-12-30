function populateAgegroupLookup(){
	Ti.API.info('populateAgegroupLookup called');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 18 and under');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 19 to 24');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 25 to 29');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 30 to 34');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 35 to 39');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 40 to 44');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 45 to 49');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 50 to 54');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 55 to 59');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 60 to 64');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 65 to 69');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Men 70 and above');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 18 and under');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 19 to 24');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 25 to 29');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 30 to 34');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 35 to 39');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 40 to 44');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 45 to 49');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 50 to 54');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 55 to 59');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 60 to 64');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 65 to 69');
	dbMain.execute('INSERT INTO agegroup_lk(desc) VALUES(?)','Women 70 and above');
}