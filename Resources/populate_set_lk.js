function populateSetLookup(){
	Ti.API.info('populateSetLookup called');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 1 (Legs 1, 13 and 25)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 2 (Legs 2, 14 and 26)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 3 (Legs 3, 15 and 27)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 4 (Legs 4, 16 and 28)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 5 (Legs 5, 17 and 29)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 6 (Legs 6, 18 and 30)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 7 (Legs 7, 19 and 31)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 8 (Legs 8, 20 and 32)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 9 (Legs 9, 21 and 33)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 10 (Legs 10, 22 and 34)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 11 (Legs 11, 23 and 35)');
	dbMain.execute('INSERT INTO set_lk(desc) VALUES(?)','Set 12 (Legs 12, 24 and 36)');
}