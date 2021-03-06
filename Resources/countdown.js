var countDownTimer;
var assignedStartTime = 0;

function countDownDisplay(){
	countDownTimer = setInterval(function()
	{
				var now = new Date();
				var ms = assignedStartTime - now.getTime();
				try{
					if (ms < 0){
						clearInterval(countDownTimer);
						labelCountDown.text = ''; // the race has started
						
					} else {
						labelCountDown.text = getCountDownDisplay(ms);
					}
				}catch(err){
					Ti.API.info('Error thrown by countDownDisplay() function: '+err);
				}
	},500);

};

function getCountDownDisplay(ms){
	var currentTime = ms;

	try{
		days = Math.floor(currentTime / 86400000);
		currentTime = currentTime - (days * 86400000);
		hours = Math.floor(currentTime / 3600000);
		currentTime = currentTime - (hours * 3600000);
		minutes = Math.floor(currentTime / 60000);
		currentTime = currentTime - (minutes * 60000);
		seconds = Math.floor(currentTime / 1000);
		
		if (seconds == 60){
			minutes++;
			seconds = 0;
		}

		if (minutes == 60){
			hours++;
			minutes = 0;
		}
		//currentTime = currentTime - (seconds * 1000);
		//tenths = Math.round(currentTime / 100);
		dayStr = (days == 1) ? days+' day ' : days+' days ';
		hrStr = (hours == 1) ? hours+' hour ' : hours+' hours ';
		if(minutes < 10){
			minStr = (minutes == 1) ? '0'+minutes+' minute ' : '0'+minutes+' minutes ';
		} else {
			minStr = (minutes == 1) ? minutes+' minute ' : +minutes+' minutes ';
		}
		if(seconds < 10){
			secStr = (seconds == 1) ? '0'+seconds+' second ' : '0'+seconds+ ' seconds ';
		}else {
			secStr = (seconds == 1) ? seconds+' second ' : seconds+ ' seconds ';
		}
	 	
		//var displayString = hrStr+':'+minStr+':'+secStr+'.'+tenths;
		displayStr = dayStr+hrStr+minStr+secStr;
	} catch(err){
		Ti.API.info('Error thrown by getCountDownStr() function: '+err);
		displayStr = '';
	}
	return displayStr;

}
