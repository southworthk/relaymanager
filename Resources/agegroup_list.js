var win = Titanium.UI.currentWindow;
win.barColor = 'black';

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var tableData = [];
var previousRowData;
var selectedId;

win.backButtonTitle = 'Cancel';

var saveBtn = Titanium.UI.createButton({
	title:'Save'
});

saveBtn.addEventListener('click',function(e){
	var agId = selectedId;
	Titanium.App.Properties.setInt('AgeGroupId',agId); 
	Ti.API.info('age group id: '+agId);
	win.setRightNavButton(null);
	win.backButtonTitle = 'Return';
});

win.setRightNavButton(null);

//create table view
var tableview = Titanium.UI.createTableView({
	data:tableData
});

tableview.addEventListener('click', function(e){
	win.setRightNavButton(saveBtn);
	if(previousRowData != null){
		previousRowData.hasCheck = false;
	}
	selectedId = e.rowData.test;
	e.rowData.hasCheck = true;
	previousRowData = e.rowData;
});

win.add(tableview);

win.addEventListener('open', function(){
	var dbTable = Titanium.Database.open('main');
	var rows = dbTable.execute('SELECT agegroup_id,desc FROM agegroup_lk ORDER BY agegroup_id');
	while(rows.isValidRow()){
		var agegroupId = rows.field(0);
		var desc = rows.field(1);
		tableData.push({title:desc, hasChild:false, test:agegroupId});
		rows.next();
	}
	rows.close();
	dbTable.close();
	tableview.setData(tableData);
});

