var win = Titanium.UI.currentWindow;
win.barColor = 'black';

var rosterData = [];
win.backgroundImage = 'gradientBackground.png';

var contactadd = Titanium.UI.createButton({
	systemButton:Titanium.UI.iPhone.SystemButton.CONTACT_ADD
});
contactadd.addEventListener('click', function()
{
	var win = Titanium.UI.createWindow({
		url:'add_runner.js',
		title:'Add Runner',
		tabBarHidden:true
	});
	win.editStatus = 0;
	win.rid = -1; // the runner id
	Titanium.UI.currentTab.open(win,{animated:true});
});

win.setRightNavButton(contactadd);

var headerView = Ti.UI.createView({
	height:30
});


win.addEventListener('focus', function(){
	createRosterTableView(1);
});

function createRosterTableView(sortOrder){
	rosterData = [];
	var sqlStmt = 'SELECT runner_id,first_name,last_name,set_id FROM runner ';
	if(sortOrder == 0){
		sqlStmt += 'ORDER BY first_name';
	}else{
		sqlStmt += 'ORDER BY set_id,first_name';
	}
	var dbRunner = Titanium.Database.open('main');
	var rows = dbRunner.execute(sqlStmt);
	
	var counter = 0;
	while(rows.isValidRow()){
		var runnerId = rows.field(0);
		var firstName = rows.field(1);
		var lastName = rows.field(2);
		var fullName = firstName+' '+lastName;
		var setNum = rows.field(3);
		setNum = (setNum == null) ? 'Set assignment pending' : 'Assigned to set '+setNum;
		
		var row = Ti.UI.createTableViewRow();
		row.hasDetail = true;
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
	
};

var tableviewRoster = Titanium.UI.createTableView({
	data:rosterData,
	style:Titanium.UI.iPhone.TableViewStyle.PLAIN,
	backgroundColor:'transparent',
	headerView:headerView,
	maxRowHeight:55,
	minRowHeight:55,
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE
});

tableviewRoster.addEventListener('click', function(e){
	var runnerId = e.source.rid;

	if((e.detail == 0) || (e.detail == false)){
		runnerId = rosterData[e.index].rid;
	}
	
	var win = Titanium.UI.createWindow({
		url:'add_runner.js',
		title:'Edit Runner',
		tabBarHidden:true
	});
	win.editStatus = 1;
	win.rid = runnerId;
	Titanium.App.Properties.setInt('CurrentRunnerId',runnerId);

	Titanium.UI.currentTab.open(win,{animated:true});
});

win.add(tableviewRoster);