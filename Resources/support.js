var win = Titanium.UI.currentWindow;
var dbMain;
var raceId;
var webview;
var htmlStr;
var teamKey;
var teamToken;
var hoActive = 0;
var hoKey = "";
var hoSlave = "";
var teamKey = "";
var teamPredictionKey = "";

win.barColor = 'black';

//var reportData = [];
var supportData = [];

win.backgroundImage = 'gradientBackground.png';
var bgColor = '#FFF';

if (Titanium.Platform.name != 'iPhone OS')
{
	bgColor = '#000';
}

Ti.include('get_displaytime.js');

function getAbout(){
	htmlStr = '<html><body>';
	htmlStr += '<h3>RelayManager</h3>Version 1.7<br>Copyright 2010 SineQuaNon Solutions<p>';
	if(hoActive){
		htmlStr += 'Handoff key: ...'+hoKey.substring(35)+'<br>';
		htmlStr += 'Team key: ...'+teamKey.substring(30)+'<br>';
		htmlStr += 'Prediction key: ...'+teamPredictionKey.substring(40)+'';
		htmlStr += '<p>Data sharing: enabled<br>Team token: '+hoSlave+'<br>';
	}else{
		htmlStr += 'Data sharing: disabled<br>';
	}
	if(Titanium.Network.online == 1){
		htmlStr += 'Network status: connected<br>';
	}else{
		htmlStr += 'Network status: not connected<br>';
	}
	htmlStr += '</body></html>';
	return htmlStr;
	
}

function getContactInfo(){
	htmlStr = '<html><body>';	
	htmlStr += '<h3>RelayManager 1.7</h3>';
	htmlStr += 'If you have any questions, suggestions or problems using this software, please don&apos;t hesitate to get in touch ';
	htmlStr += 'with us. We will work quickly to resolve any issues that you might have. Please contact us at:<p>';
	htmlStr += '<b>support@sinequanonsolutions.com</b><br><br> ';
	htmlStr += 'We may need the following information to resolve your issue: <br><br>';
	htmlStr += 'Name/OS: ' + Titanium.Platform.name+'/'+Titanium.Platform.osname+'<br>';
	htmlStr += 'Model: ' + Titanium.Platform.model+'<br>';
	htmlStr += 'Version: ' + Titanium.Platform.version+'<br>';
	htmlStr += 'Available Memory: ' + Titanium.Platform.availableMemory+'<br>';
	htmlStr += '</body></html>';
	return htmlStr;
}

function getStarted(){
	htmlStr = '<html><body>';	
	htmlStr += '<h3>Getting Started Guide</h3>';
	htmlStr += '<ol>';
	htmlStr += '<li type="1">If you have received a team token and intend to share data with another device, ignore the steps outlined below and read the Help section titled Data Sharing Support.';
	htmlStr += '<li type="1">Select your race from the Setup menu (on the Setup tab). If you don&apos;t know what race you&apos;ll be running at this point, you can come back to this but you will not be able to complete the race setup without making this selection. Once the race is selected it will start showing up on the home page.';
	htmlStr += '<li type="1">Fill out your team roster. Put in as much information as you have and come back later if you need to. Again, you will not be able to complete the race setup and start the race timer until all sets in the race are assigned. Mileage, speed and age group will help predict the amount of time required to complete a leg.';
	htmlStr += '<li type="1">Enter your team name on the Set up Team dialog. You can come back and fill in the team number and assigned start time at a later time if you don&apos;t currently have that information. The team name will display on the home screen.';
	htmlStr += '<li type="1">Once you have selected a race and assigned runners to all twelve slots, you can proceed to the Prepare for Race Start screen (on the Setup menu). Correct any items that do not have a green checkmark next to them. You can check runner assignments by looking at the Runner Order report on the Reports tab.';
	htmlStr += '<li type="1">After finalizing leg assignments, you are ready to start timing your race. You can (and probably should) do a dry run before the actual race. Get familiar with how you have to prepare to record the race start or a handoff, before the button to record the event is enabled (this is to prevent accidental starts and stops). When you are satisfied how the time works, you can go to the Setup menu and select Abort Race. Be aware that this option deletes all the race times you have previously recorded. ';
	htmlStr += '<li type="1">During the race you can view the results that have been recorded so far (n/a will show for legs that are in progress). You can also view the Leg Overview report to get information on upcoming legs. Return to the main report menu and select the report again to refresh.';
	htmlStr += '<li type="1">Take a few minutes after the relay to drop us a line and let us know if you saw any problems with this application or inaccuracies in the leg data. We would also love to hear your suggestions on how we could make this product better (use Contact Support from the Help menu). ';
	htmlStr += '<li type="1">Stay current on Relay Manager issues and updates by checking out our blog. You can access it anytime through the Help menu. ';
	htmlStr += '<li type="1">A short video that steps you through these instructions can be found <a href="http://www.youtube.com/watch?v=s82aq9qiIGI">here</a>.';
	htmlStr += '</ol>';
	htmlStr += '</body></html>';
	return htmlStr;
}

function getTrackingInfo(){
	htmlStr = '<html><body>';
	htmlStr += '<h3>Data Sharing Support</h3>';
	htmlStr += 'With data sharing enabled you can use multiple devices to track runner progress and even record handoffs. ';
	htmlStr += 'One device should be the master device which contains the complete roster and leg assignments, along with the race selection.';
	htmlStr += 'All other devices will play a subordinate role and will obtain the roster and other pertinent information by ';
	htmlStr += 'providing the team token that is generated by the master device. You can watch a video of how this works by clicking <a href="http://www.youtube.com/watch?v=1nl8s6Ta20o">here</a>.<p> ';
	htmlStr += '<h4>Instructions for Master Device</h4>';
	htmlStr += 'After selecting Prepare for Race Start on the Setup menu and completing all the required steps, select ';
	htmlStr += 'Enable Data Sharing to obtain a team token from our secure server. This token can be given to teammates who want ';
	htmlStr += 'timekeeping responsibilities or to family and friends who want to track your progress during the race.<p>';
	htmlStr += '<h4>Instructions for Subordinate Devices</h4>';
	htmlStr += 'Instead of entering roster or race data in yourself, go to the Setup menu and select Enter Team Token. There ';
	htmlStr += 'you will be prompted for team token. After entering it and pressing submit, you should receive a notice that indicates that data sharing support has been enabled. ';
	htmlStr += 'You can choose whether to immediately begin listening for updates from the other device or you can postpone that if the race has not yet started. ';
	htmlStr += 'To change the listening status for your device or to enable it to begin recording handoffs, select Change Data Sharing Role from the Setup menu. ';
	htmlStr += 'You will want to coordinate with others on your team so that only one person at a time is recording handoffs.<p>';
	htmlStr += 'With those steps completed, you can go to the Timer tab and see that all of the race information for the first leg is in place. ';
	htmlStr += 'On race day, your family and friends can go to our ';
	htmlStr += 'web site and enter your team token to receive live updates of your progress. The URL is<p>';
	htmlStr += '<h4>http://goo.gl/dERnx</h4><p>';
	htmlStr += 'As this web site contains Flash content you won&apos;t be able to view it in your iOS browser, ';
	htmlStr += 'but then, that is what this application is for. Be aware that updates of your progress are uploaded at ';
	htmlStr += 'exchange points by establishing a connection to the internet. If for some reason that connection ';
	htmlStr += 'cannot be established, your times will be uploaded at the next exchange that is in cell phone ';
	htmlStr += 'range.<p> Please contact us at<p><b>support@sinequanonsolutions.com</b><p> ';
	//htmlStr += 'asked to verify the following information:<p>';
	//htmlStr += 'Team Key : <br><b>'+teamKey+'</b><p>';
	//htmlStr += 'Team Token: <br><b>...'+hoSlave+'</b><p>';
	htmlStr += 'Be aware that polling of the server occurs every two minutes so there may be a some delay between the time that ';
	htmlStr += 'a handoff is recorded and the update appears on your device.';
	htmlStr += '</body></html>';
	return htmlStr;
}

function getEditingInfo(){
	htmlStr = '<html><body>';	
	htmlStr += '<h3>Guidelines</h3>';
	htmlStr += 'The ability to manually edit times was added to Relay Manager in order to resolve discrepancies between ';
	htmlStr += 'different methods of recording the duration of the various legs. This is particularly valuable, if there ';
	htmlStr += 'is only a single copy of the Relay Manager application on a single device and that device is not passed ';
	htmlStr += 'on to the other van. If the device is in the second van, every attempt should be made to start Relay ';
	htmlStr += 'Manager at the the same time as the offical start (if not, select the Edit Start Time option from the Setup ';
	htmlStr += 'menu). The first five handoffs can then be recorded one after another (with durations around ten ';
	htmlStr += 'seconds or so), but the sixth runner&apos;s handoff should be recorded at the major exchange exactly when it '; 
	htmlStr += 'happens. The actual times from the first van can then be retrieved and entered manually in Relay Manager.<p>';
	htmlStr += 'It is important to keep in mind, that every time you edit the time for a given leg there will be an automatic ';
	htmlStr += 'adjustment for the leg that follows. The ending time for the leg being updated becomes the starting time ';
	htmlStr += 'for the leg that follows. For that reason, it is important that you edit leg times from the lowest leg number to the highest.<p>';
	//htmlStr += 'Please also note that it is not advisable to enable data sharing when manual editing of legs is planned '; 
	//htmlStr += 'during the relay, as family and friends may become hopelessly confused when seeing distances of '; 
	//htmlStr += 'several miles being covered in only a matter of seconds and the last leg of a set requiring hours to complete.';
	htmlStr += '</body></html>';
	return htmlStr;
};

function getDisclosureStatement(){
	htmlStr = '<html><body>';	
	htmlStr += '<h3>Disclosure Statement</h3>';
	htmlStr += 'Enabling data sharing facilitates communication with SineQuaNon Solutions and secures transmission of relay data to those you may designate. We do not sell, trade or otherwise transfer to outside parties your personally identifiable information. We may release your information when we believe release is appropriate to comply with the law or protect ours or others rights, property or safety. Non-personally identifiable information may be provided to other parties for marketing, advertising or other uses.';
	htmlStr += '</body></html>';
	return htmlStr;	
};

function getFAQ(){
	htmlStr = '<html><body>';	
	htmlStr += '<h3>Frequently Asked Questions</h3>';
	htmlStr += '<b>Where can I find maps of the exchange points?</b><br>';
	htmlStr += 'If a map is available, the leg number in the Leg Overview report links to the starting exchange for that leg.<br><br>';
	htmlStr += '<b>After I have done a practice race how do I reset everything?</b><br>';
	htmlStr += 'Watch this short <a href="http://www.youtube.com/watch?v=0c7ZAeJSRpI">video</a> and it will show you the necessary steps.<br><br>';
	htmlStr += '<b>Do I have to keep the app open the whole race? Do I lose my timing if the app closes unexpectedly?</b><br>';
	htmlStr += 'The answer to both questions is <i>no</i>. The starting time of each leg is recorded in a database. If you close the application or it crashes for some reason, it can quickly figure out the elapsed amount of time by subtracting the start time from the current system time.<br><br>';
	htmlStr += '<b>I don&apos;t have mileage information on my teammates. Should I just guess? Why is that even necessary? </b><br>';
	htmlStr += 'A runner&apos;s weekly mileage is one of the factors that helps us predict leg finish time. Generally, the higher a runner&apos;s weekly mileage, the less he/she will fatigue during the later stages of a relay. Keeping track of this information can also help in making leg assignments. ';
	htmlStr += '<br><br>';
	htmlStr += '<b>My upcoming race isn&apos;t in the list. What can I do?</b><br>';
	htmlStr += 'Refresh the list of available races by pulling down on the table. If you still don&apos;t see your race, just contact us (you will find the support email address under Contact Us on the Help tab) and we will do our best to add it, provided it&apos;s a thirty-six leg relay and the race information is readily available. ';
	htmlStr += '<br><br>';
	htmlStr += '<b>The Manage Roster screen is blank. How do I add runners?</b><br>';
	htmlStr += 'Press the blue plus symbol on the right side of the navigation bar and the Add Runner dialog will appear.';
	htmlStr += '<br><br>';
	htmlStr += '<b>Why do I have to click on the Prepare to Handoff button before I can actually record the handoff? That seems kind of cumbersome.</b><br>';
	htmlStr += 'That is a safety feature to prevent you from accidentally recording an event. As there is no way to edit the data after the fact, we want to be sure that you don&apos;t record a handoff just by putting the device in your pocket.';
	htmlStr += '<br><br>';
	htmlStr += '<b>We don&apos;t have a team number. Do I have to have that before I can start the race?</b><br>';
	htmlStr += 'No, you have to have selected a race and assigned twelve sets to twelve runners and deleted partial race results, but the team name and number are optional.';
	htmlStr += '<br><br>';
	htmlStr += '<b>We have an ultra team with just six runners. Can we still use this tool?</b><br>';
	htmlStr += 'Currently the only way to accomodate ultra teams is to enter each runner twice for a six runner team and just ensure that all twelve sets are assigned.';
	htmlStr += '<br><br>';
	htmlStr += '</body></html>';
	return htmlStr;
}

function getReference(){
	htmlStr = '<html><body>';	

	htmlStr += '</body></html>';
	return htmlStr;
}

function getLinks(){
	htmlStr = '<html><body>';	

	htmlStr += '</body></html>';
	return htmlStr;
}

function getChecklist(){
	htmlStr = '<html><body>';	

	htmlStr += '</body></html>';
	return htmlStr;
}

var header = Ti.UI.createView({
	height:20
});

var headerLabel = Ti.UI.createLabel({
	font:{fontFamily:'Helvetica Neue',fontSize:18,fontWeight:'bold'},
	text:'Custom Header',
	color:'#191',
	textAlign:'left',
	left:10,
	width:'auto',
	height:'auto'
});

function notifyFriend(){
	var emailDialog01 = Titanium.UI.createEmailDialog();
	if (!emailDialog01.isSupported()) {
		Ti.UI.createAlertDialog({
			title:'Error',
			message:'Email is not available.'
		}).show();
		return;
	}
	emailDialog01.setSubject('Relay Manager 1.7');
	//emailDialog01.setToRecipients(['']);
	emailDialog01.setMessageBody('Relay Manager is the top-rated iPhone app for a thirty-six leg relay races! Check it out <a href="http://itunes.apple.com/us/app/relay-manager/id378080198?mt=8">here</a>.');
	emailDialog01.setHtml(true);
	//emailDialog02.setCcRecipients(['bar@yahoo.com']);
	//emailDialog02.setBccRecipients(['blah@yahoo.com']);
	emailDialog01.addEventListener('complete',function(e)
	{
		if (e.result == emailDialog01.SENT)
		{
			if (Ti.Platform.osname != 'android') {
				// android doesn't give us useful result codes.
				// it anyway shows a toast.
				alert("Your message has been sent.");
			}
		}
		else
		{
			alert("Your message was not sent.");
		}
	});
	emailDialog01.open();
};


var reloadBtn = Ti.UI.createButton({
	title:'Refresh'
});

reloadBtn.addEventListener('click',function(e){
	getLegReport();
});

var backBtn = Titanium.UI.createButton({
	title:'Help'
});

backBtn.addEventListener('click',function(e){
	win.remove(webview);
	win.title = 'Help';
	win.leftNavButton = null;
});

supportData[0] = Ti.UI.createTableViewSection({headerTitle:''});

supportData[0].add(Ti.UI.createTableViewRow({title:'About RelayManager', hasChild:true, backgroundColor:bgColor}));
supportData[0].add(Ti.UI.createTableViewRow({title:'Contact Support', hasChild:true, backgroundColor:bgColor}));
supportData[0].add(Ti.UI.createTableViewRow({title:'Getting Started Guide', hasChild:true, backgroundColor:bgColor}));
supportData[0].add(Ti.UI.createTableViewRow({title:'Frequently Asked Questions', hasChild:true, backgroundColor:bgColor}));
supportData[0].add(Ti.UI.createTableViewRow({title:'Data Sharing Support',hasChild:true,backgroundColor:bgColor}));
supportData[0].add(Ti.UI.createTableViewRow({title:'Manual Editing of Time',hasChild:true,backgroundColor:bgColor}));

supportData[1] = Ti.UI.createTableViewSection({headerTitle:''});

supportData[1].add(Ti.UI.createTableViewRow({title:'Disclosure Statement', hasChild:true, backgroundColor:bgColor}));
supportData[1].add(Ti.UI.createTableViewRow({title:'Relay Manager Blog', hasChild:true, backgroundColor:bgColor}));
supportData[1].add(Ti.UI.createTableViewRow({title:'Tell a Friend About This App', hasChild:true, backgroundColor:bgColor}));
supportData[1].add(Ti.UI.createTableViewRow({title:'Like Us? Write a Review', hasChild:true, backgroundColor:bgColor}));


//create table view
var tableviewReport = Titanium.UI.createTableView({
	data:supportData,
	style:Titanium.UI.iPhone.TableViewStyle.GROUPED
});

//create table view event listener
tableviewReport.addEventListener('click', function(e)
{
	webview = Ti.UI.createWebView();
	switch(e.index){
	case 0:
		win.title = 'About';
		webview.html = getAbout();
		break;
	case 1:
		contactSupport();
		//win.title = 'Contact Support';
		//webview.html = getContactInfo();
		break;
	case 2:
		win.title = 'Getting Started';
		webview.html = getStarted();
		break;
	case 3:
		win.title = 'FAQ';
		webview.html = getFAQ();
		break;
	case 4:
		win.title = 'Web Tracking';
		webview.html = getTrackingInfo();
		break;
	case 5:
		win.title = 'Editing Times';
		webview.html = getEditingInfo();
		break;
	case 6:
		win.title = 'Disclosure';
		webview.html = getDisclosureStatement();
		break;
	case 7:
		win.title = ''; 
		webview.url = 'http://sinequanonsolutions.com/blog';
		break;
	case 8:
		notifyFriend();
		break;
	case 9:
		win.title = 'Write Review';
		webview.url = 'http://itunes.apple.com/us/app/relay-manager/id378080198?mt=8';
		break;
	}
	win.leftNavButton = backBtn;
	//win.rightNavButton = reloadBtn;
	//win.setLeftNavButton(backBtn);
	win.add(webview);

});

function contactSupport(){
	var emailDialog02 = Titanium.UI.createEmailDialog();
	if (!emailDialog02.isSupported()) {
		Ti.UI.createAlertDialog({
			title:'Error',
			message:'Email not available'
		}).show();
		return;
	}
	emailDialog02.setSubject('Relay Manager 1.7');
	emailDialog02.setToRecipients(['support@sinequanonsolutions.com']);
	emailDialog02.addEventListener('complete',function(e)
	{
		if (e.result == emailDialog02.SENT)
		{
			if (Ti.Platform.osname != 'android') {
				// android doesn't give us useful result codes.
				alert("Your message has been sent.");
			}
		}
		else
		{
			alert("Your message was not sent.");
		}
	});
	emailDialog02.open();
};


win.addEventListener('focus', function(e){
	dbMain = Titanium.Database.open('main');
	raceId = Titanium.App.Properties.getInt('RaceId');
	row = dbMain.execute('SELECT team_key,team_prediction_key FROM team_identity WHERE team_id = 1');
	if(row.isValidRow()){
		teamKey = row.field(0);
		teamPredictionKey = row.field(1);
	}
	row.close();
	var handoffStatus = dbMain.execute('SELECT active, handoff_key, slave_token FROM handoff_status WHERE handoff_id = 1');
	if(handoffStatus.isValidRow()){
		hoActive = handoffStatus.field(0);
		hoKey = handoffStatus.field(1);
		hoSlave = handoffStatus.field(2);
		Ti.API.info('active: '+hoActive);
		Ti.API.info('handoffkey: '+hoKey);
	}
	handoffStatus.close();
/*	var teamQuery = dbMain.execute("SELECT team_key,team_prediction_key FROM team_identity WHERE team_id = 1");
	if(teamQuery.isValidRow()){
		teamKey = teamQuery.field(0);
		teamPredictionKey = teamQuery.field(1);
	}
*/
	var myTeamKey = teamKey;
	//teamQuery.close();

});

win.add(tableviewReport);