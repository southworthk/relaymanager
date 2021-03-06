var win = Titanium.UI.currentWindow;
Ti.include("biz_logic.js");

var submitBtn = Titanium.UI.createButton({
	top:240,
	height:40,
	width:210,
	title: 'Submit',
	enabled:true
});

var problemAlert = Titanium.UI.createAlertDialog({
	title:'Test Alert',
	message:'This is a test of the emergency broadcast system.'
});

submitBtn.addEventListener('click',function(e){
	//setNetworkStatusForLeg(15,0);
	//setServerStatusForLeg(26);
	//problemAlert.message = "The time for leg 3 is: "+requestServerStatusForLeg(3);
	problemAlert.message = 'Check to see how many legs there are leg_results';
	problemAlert.show();	
});

function showLegs(){
		var rows = dbMain.execute('SELECT l.leg_number, r.leg_start, r.leg_end, l.distance,l.set_number,l.rating_id,l.elev_gain,l.elev_loss FROM relay_results r, race_leg l WHERE r.leg_id = l.leg_number AND l.race_id = ? ORDER BY r.leg_id',rid);
		Ti.API.info('rowCount for getLegReport query: '+rows.getRowCount());	
		while(rows.isValidRow()){
			Ti.API.info('leg_number: '+rows.field(0));
			Ti.API.info('leg_number: '+rows.field(0));
			Ti.API.info('leg_number: '+rows.field(0));
			
		}
		rows.close();
};

win.add(submitBtn);
