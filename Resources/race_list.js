var win = Titanium.UI.currentWindow;
var dbMain;

Ti.include('biz_logic.js');

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var raceData = [];
win.backgroundImage = 'gradientBackground.png';
var previousRowData;
var selectedRaceId;
var pulling = false;
var reloading = false;

win.backButtonTitle = 'Cancel';

var saveBtn = Titanium.UI.createButton({
	title:'Save'
});

saveBtn.addEventListener('click',function(e){
	if(selectedRaceId !== -1){
		//Ti.API.info('save button clicked');
		Titanium.App.Properties.setInt('RaceId',selectedRaceId);
		dbMain = Titanium.Database.open('main');
		dbMain.execute('UPDATE settings SET race_id = ? WHERE setting_id = 1',selectedRaceId);
		win.setRightNavButton(null);
		updateRaceDistances();
		win.backButtonTitle = 'Return';
	}
});

win.setRightNavButton(null);

var headerView = Ti.UI.createView({
	height:30
});

//create table view
var tableviewRaceList = Titanium.UI.createTableView({
	data:raceData,
	style:Titanium.UI.iPhone.TableViewStyle.PLAIN,
	backgroundColor:'transparent',
	headerView:headerView,
	maxRowHeight:55,
	minRowHeight:55,
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE
});

// start of insert

var border = Ti.UI.createView({
	backgroundColor:"#576c89",
	height:2,
	bottom:0
});

var tableHeader = Ti.UI.createView({
	backgroundColor:"#e2e7ed",
	width:320,
	height:60
});

// fake it til ya make it..  create a 2 pixel
// bottom border
tableHeader.add(border);

var arrow = Ti.UI.createView({
	backgroundImage:"whiteArrow.png",
	width:23,
	height:60,
	bottom:10,
	left:20
});

var statusLabel = Ti.UI.createLabel({
	text:"Pull to reload",
	left:55,
	width:200,
	bottom:30,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:13,fontWeight:"bold"},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});

var lastUpdatedLabel = Ti.UI.createLabel({
	text:"Last Updated: "+formatDate(),
	left:55,
	width:200,
	bottom:15,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:12},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});

var actInd = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:13,
	width:30,
	height:30
});

tableHeader.add(arrow);
tableHeader.add(statusLabel);
tableHeader.add(lastUpdatedLabel);
tableHeader.add(actInd);

tableviewRaceList.headerPullView = tableHeader;



// end of insert
function populateRaceTable(){
	var dbRace = Titanium.Database.open('main');
	var onerow = dbRace.execute("SELECT DATE('now','+2 day')");
	var todaysdate = onerow.field(0);
	//Ti.API.info(todaysdate);
	
	var rows = dbRace.execute("SELECT race_id,race_name,race_date FROM race WHERE DATE(race_date) > DATE('now','-7 day') ORDER BY race_name");
	var hasValidRow = false;
	var row = Ti.UI.createTableViewRow();
	
	var counter = 0;
	while(rows.isValidRow()){
		var raceId = rows.field(0);
		var raceName = rows.field(1);
		var raceDateStr = rows.field(2);
		//Ti.API.info("raceDateStr: "+raceDateStr);
		var raceDate = getRaceDisplayDate(raceDateStr);
		//Ti.API.info("raceDate: "+raceDate);
		//Ti.API.info("=======================");
		
		row = Ti.UI.createTableViewRow();
		row.backgroundImage = 'middleRow.png';
		row.rid = raceId;
		var label = Ti.UI.createLabel({
			text: raceName,
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
			text: 'Race date: '+raceDate,
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
		raceData[counter] = row;
		hasValidRow = true;
		counter++;
		rows.next();
	}
	rows.close();
	dbRace.close();
	
	if(!hasValidRow){
		row = Ti.UI.createTableViewRow();
		row.backgroundImage = 'middleRow.png';
		row.rid = -1;
		var label = Ti.UI.createLabel({
			text: 'No Races Found',
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
			text: 'Will try to refresh list from server.',
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
		raceData[counter] = row;
	}
	
	tableviewRaceList.setData(raceData);
	
};

win.addEventListener('open', function(){
	populateRaceTable();
});

/*
function showSelectedRace(){
	var raceId = getRaceId();
	if(raceId > 0){
		// iterate through the table to see if there is a match with the race id
		for(i=0; i < raceData.length; i++){
			if(raceData[i].rid == raceId){
				//raceData[i].hasCheck = true;
				Ti.API.info("hasCheck set to true");
				//var rows = raceData[i].rows;
				//rows[i].hasCheck = true;
			}
		}
	}
};
*/


tableviewRaceList.addEventListener('click', function(e){
	var index = e.index; 
	
	tableviewRaceList.selectRow(index);
	var raceId = raceData[index].rid;
	
	if(raceId !== -1){
		win.setRightNavButton(saveBtn);
		if(previousRowData != null){
			previousRowData.hasCheck = false;
		}
		e.rowData.hasCheck = true;	
		
		selectedRaceId = raceId;
		previousRowData = raceData[index];
	}
});

function getRaceUpdate(){
	Ti.API.info("called getRaceUpdate");
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function(){
		//Ti.API.info('getRaceUpdate onload function called');
		//Ti.API.info('xml: ' + this.responseXML + ' text ' + this.responseText);
		try{
			var dbMainRU = Titanium.Database.open('main');
			var doc = this.responseXML.documentElement;
			//Ti.API.info("doc: "+doc);
			var elements = doc.getElementsByTagName("sql");
			for(var i=0; i<elements.length; i++){
				var sql = elements.item(i).text;
				//Ti.API.info("biz_logic - sql: "+sql);
				dbMainRU.execute(sql);
			}
		}catch(e){
			Ti.API.info('getRaceUpdate Error: '+e.error);
		}
		reloading = false;
		//lastUpdatedLabel.text = "Last Updated: "+formatDate();
		//statusLabel.text = "Pull down to refresh...";
		//actInd.hide();
		//arrow.show();
		populateRaceTable();
		tableviewRaceList.setData(raceData);
		tableViewRaceList.setContentInsets({top:0},{animated:true});

	};

	xhr.open('POST','http://sinequanonsolutions.appspot.com/raceupdate');
	var data = {};
	data.procid = "3";
	data.sharedsecret = getSharedSecret();
	if(Titanium.Network.online == 1){
		xhr.send(data);
	}else{
		noNetWorkAlert.show();
	}
	
};

var noNetWorkAlert = Titanium.UI.createAlertDialog({
	title:'No Network Connection',
	message:'Unable to contact server for an updated list of races. If your race is not listed, please try again later.'
});


win.add(tableviewRaceList);

win.addEventListener('focus',function(e){
	getRaceUpdate();
});



