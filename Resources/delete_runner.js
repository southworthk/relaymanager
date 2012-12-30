var win = Titanium.UI.currentWindow;
win.barColor = 'black';
win.title = 'Delete Runner';

var rosterData = [];
win.backgroundImage = 'gradientBackground.png';

var edit = Titanium.UI.createButton({
	title:'Edit'
});

edit.addEventListener('click', function()
{
	win.setRightNavButton(cancel);
	tableviewRoster.editing = true;
});

var cancel = Titanium.UI.createButton({
	title:'Cancel',
	style:Titanium.UI.iPhone.SystemButtonStyle.DONE
});
cancel.addEventListener('click', function()
{
	win.setRightNavButton(edit);
	tableviewRoster.editing = false;
});

win.setRightNavButton(edit);

var headerView = Ti.UI.createView({
	height:30
});


win.addEventListener('focus', function(){
	rosterData = [];
	var dbRunner = Titanium.Database.open('main');
	var rows = dbRunner.execute('SELECT runner_id,first_name,last_name,set_id FROM runner ORDER BY first_name');
	
	var counter = 0;
	while(rows.isValidRow()){
		var runnerId = rows.field(0);
		var firstName = rows.field(1);
		var lastName = rows.field(2);
		var fullName = firstName+' '+lastName;
		var setNum = rows.field(3);
		setNum = (setNum == null) ? 'Set assignment pending' : 'Assigned to set '+setNum;
		
		var row = Ti.UI.createTableViewRow();
		row.hasDetail = false;
		//row.rightImage = 'indicator.png';
		row.backgroundImage = 'middleRow.png';
		row.rid = runnerId;
		
		var label = Ti.UI.createLabel({
			text: fullName,
			color: '#420404',
			shadowColor:'#FFFFE6',
			shadowOffset:{x:0,y:1},
			textAlign:'left',
			top:5,
			left:15,
			width: 'auto',
			height:'auto',
			font:{fontWeight:'bold',fontSize:18}
		});
		row.add(label);
		
		var label2 = Ti.UI.createLabel({
			text: setNum,
			color: '#420404',
			shadowColor:'#FFFFE6',
			textAlign:'left',
			shadowOffset:{x:0,y:1},
			font:{fontWeight:'bold',fontSize:13},
			bottom:10,
			height:'auto',
			left:15,
			right:50
		});
		row.add(label2);
		rosterData[counter] = row;
		
		//rosterData.push({title:fullName, hasDetail:true, test:runnerId, setNumber:setNum});
		counter++;
		rows.next();
	}
	rows.close();
	dbRunner.close();
	tableviewRoster.setData(rosterData);
});

var tableviewRoster = Titanium.UI.createTableView({
	data:rosterData,
	style:Titanium.UI.iPhone.TableViewStyle.PLAIN,
	backgroundColor:'transparent',
	headerView:headerView,
	maxRowHeight:55,
	minRowHeight:55,
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE
});

/*
tableviewRoster.addEventListener('click', function(e){
	var runnerId = e.source.rid;
	var win = Titanium.UI.createWindow({
		url:'add_runner.js',
		title:'Edit Runner',
		tabBarHidden:true
	});
	win.editStatus = 1;
	win.rid = runnerId;
	Titanium.App.Properties.setInt('CurrentRunnerId',runnerId);
	//Ti.API.info('tableviewRoster click event: '+runnerId);
	Titanium.UI.currentTab.open(win,{animated:true});
});
*/



//add delete event listener
tableviewRoster.addEventListener('delete',function(e)
{
	var runnerId = e.source.rid;
	Ti.API.info('runnerId: '+runnerId);
	
	// DELETE runner from runner table
	var dbMain = Titanium.Database.open('main');
	dbMain.execute('DELETE FROM runner WHERE runner_id = ?',runnerId);
	
	// CHANGE settings table to not ready
	dbMain.execute('UPDATE settings SET ready_to_start = 0 WHERE setting_id = 1');
	
	// DELETE leg assignment table
	dbMain.execute('DELETE FROM set_assignment');
	
	var a = Titanium.UI.createAlertDialog({
		title:'Alert',
		message:'Runner has been deleted. Before starting the race you will need to verify that you have sufficient runners and finalize leg assignments (even if you have done so previously).'
	});
	
	a.show();


});

win.add(tableviewRoster);