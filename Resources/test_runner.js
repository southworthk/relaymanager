
dbMain.execute('DELETE FROM settings');
dbMain.execute('INSERT INTO settings(setting_id,team_name, team_number, assigned_team_start, current_set_id, current_agegroup_id, race_id, start_of_relay, start_of_leg, end_of_relay, current_leg, current_runner_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',1,'2Slow2Win2Dumb2Quit','195','11:00',0,0,9,0,0,0,0,0);
//dbMain.execute('UPDATE settings SET team_name = ?, team_number = ?, assigned_team_start = ?, current_set_id = ?, current_agegroup_id = ?, race_id = ?, start_of_relay = ?, start_of_leg = ?, end_of_relay = ?, current_leg = ?, current_runner_id = ? WHERE setting_id = 1','2Slow2Win2Dumb2Quit','195','11:00',0,0,9,0,0,0,0,0);
dbMain.execute('DELETE FROM runner');
dbMain.execute('DELETE FROM relay_results');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Greg','Johnson','1','8.5','35');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Eric','Jurgens','2','8.1','38');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Kerry','Southworth','3','7.5','25');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Verdon','Walker','4','7.1','31');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Kevin','Jessop','5','8.7','40');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Ryan','Farley','6','9.2','45');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Deeks','','7','7.7','28');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Dan','Rapp','8','7.3','27');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Scott','Colemere','9','8.9','50');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Will','Peterson','10','8.6','48');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Paul','Thomas','11','9.1','52');
dbMain.execute('INSERT INTO runner(first_name,last_name,set_id,ten_k_speed,miles_per_week) VALUES(?,?,?,?,?)','Lyle','Brereton','12','7.4','32');

//dbMain.execute('UPDATE team_identity SET team_key = ?, team_prediction_key = ? WHERE team_id = 1','ahNzaW5lcXVhbm9uc29sdXRpb25zcgwLEgRUZWFtGKSTBAw','-1');