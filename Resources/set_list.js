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
	var setId = selectedId;
	Titanium.App.Properties.setInt('SetId',setId); 
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
	Ti.API.info('tableview click event (selectedId): '+selectedId);
	e.rowData.hasCheck = true;
	previousRowData = e.rowData;
});

win.add(tableview);

win.addEventListener('open', function(){
	var dbTable = Titanium.Database.open('main');
	var rows = dbTable.execute('SELECT set_id,desc FROM set_lk ORDER BY set_id');
	while(rows.isValidRow()){
		var setId = rows.field(0);
		var desc = rows.field(1);
		tableData.push({title:desc, hasChild:false, test:setId});
		rows.next();
	}
	rows.close();
	dbTable.close();
	tableview.setData(tableData);
});

