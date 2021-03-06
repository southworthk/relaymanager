var win = Titanium.UI.currentWindow;
win.barColor = 'black';

var setupData = [];

var header = Ti.UI.createView({
	height:20
});


var bgColor = '#FFF';

if (Titanium.Platform.name == 'iPhone OS'){
	win.backgroundImage = 'gradientBackground.png';
}else{
	bgColor = '#000';
	win.backgroundColor = '#000';
}

var headerLabel = Ti.UI.createLabel({
	font:{fontFamily:'Helvetica Neue',fontSize:18,fontWeight:'bold'},
	text:'Custom Header',
	color:'#191',
	textAlign:'left',
	left:10,
	width:'auto',
	height:'auto'
});

//header.add(headerLabel);

setupData[0] = Ti.UI.createTableViewSection();
//section.headerView = header;

//setupData[0] = section;

//setupData[0].add(Ti.UI.createTableViewRow({title:'Run Test Cases', hasChild:true, test:'test_case.js', backgroundColor:bgColor}));
setupData[0].add(Ti.UI.createTableViewRow({title:'Select Race', hasChild:true, test:'race_list.js', backgroundColor:bgColor}));
setupData[0].add(Ti.UI.createTableViewRow({title:'Manage Roster', hasChild:true, test:'roster.js', backgroundColor:bgColor}));
setupData[0].add(Ti.UI.createTableViewRow({title:'Set up Team', hasChild:true, test:'team_setup.js', backgroundColor:bgColor}));
setupData[0].add(Ti.UI.createTableViewRow({title:'Delete Runner', hasChild:true, test:'delete_runner.js', backgroundColor:bgColor}));
setupData[0].add(Ti.UI.createTableViewRow({title:'Prepare for Race Start', hasChild:true, test:'race_start.js', backgroundColor:bgColor}));

setupData[1] = Ti.UI.createTableViewSection();
//section1.headerView = header;

setupData[1].add(Ti.UI.createTableViewRow({title:'Update Race Distances',hasChild:true, test:'update_distance.js',backgroundColor:bgColor}));
setupData[1].add(Ti.UI.createTableViewRow({title:'Enable Data Sharing',hasChild:true, test:'enable_sharing.js',backgroundColor:bgColor}));
setupData[1].add(Ti.UI.createTableViewRow({title:'Disable Data Sharing',hasChild:true, test:'disable_sharing.js',backgroundColor:bgColor}));
setupData[1].add(Ti.UI.createTableViewRow({title:'Enter Team Token',hasChild:true, test:'enter_token.js',backgroundColor:bgColor}));
setupData[1].add(Ti.UI.createTableViewRow({title:'Change Data Sharing Role',hasChild:true, test:'listening_status.js',backgroundColor:bgColor}));
//setupData[1].add(Ti.UI.createTableViewRow({title:'Change Time Keeper Status',hasChild:true, test:'timekeeper_status.js',backgroundColor:bgColor}));
//setupData[1].add(Ti.UI.createTableViewRow({title:'Enable Web Tracking',hasChild:true, test:'enable_tracking.js',backgroundColor:bgColor}));
//setupData[1].add(Ti.UI.createTableViewRow({title:'Disable Web Tracking',hasChild:true, test:'disable_tracking.js',backgroundColor:bgColor}));
setupData[1].add(Ti.UI.createTableViewRow({title:'Manually Edit Start Time',hasChild:true, test:'edit_starttime.js',backgroundColor:bgColor}));
setupData[1].add(Ti.UI.createTableViewRow({title:'Manually Edit Times',hasChild:true, test:'manual_edit.js',backgroundColor:bgColor}));

setupData[2] = Ti.UI.createTableViewSection();

setupData[2].add(Ti.UI.createTableViewRow({title:'Abort Race',hasChild:true, test:'abort_race.js', backgroundColor:bgColor}));
setupData[2].add(Ti.UI.createTableViewRow({title:'Delete Relay Results',hasChild:true, test:'delete_results.js', backgroundColor:bgColor}));
//section.add(Ti.UI.createTableViewRow({title:'Bonjour Test',hasChild:true, test:'timekeeper_handoff.js', backgroundColor:bgColor}));

//create table view
var tableviewSetup = Titanium.UI.createTableView({
	data:setupData,
	style:Titanium.UI.iPhone.TableViewStyle.GROUPED
});

//create table view event listener
tableviewSetup.addEventListener('click', function(e)
{

	if (e.rowData.test)
	{
		var win = null;
		if (Ti.Platform.name == "android") {
			win = Titanium.UI.createWindow({
				url:e.rowData.test,
				title:e.rowData.title,
				backgroundColor:'#000'
			});
		} else {
			Ti.API.info('OS X detected');

			win = Titanium.UI.createWindow({
				url:e.rowData.test,
				title:e.rowData.title,
				backgroundColor:'#fff',
				barColor:'#111'
				
			});
			Ti.API.info(e.rowData.test);
		}
		
		if (e.index == 0){
			//var saveBtn = Ti.UI.createButton
			Ti.API.info('Select Race option selected');
		}
		
		
		if (e.index == 3 || e.index == 4)
		{
			win.hideTabBar();
		}
		Titanium.UI.currentTab.open(win,{animated:true});
		//Ti.API.info('Opened current tab');
	}
});

win.add(tableviewSetup);
