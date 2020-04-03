
/*
 
 File:Game.js
 
 Abstract: JavaScript for the game.html file
 
 Version: <1.0>
 
 Copyright (C) 2007 Les Bird. All Rights Reserved.
 
*/ 
 
// Set up basic in-game variables

var numberOfBlocks=25;
var numberOfBots=5;
var numberOfColumns=10;
var numberOfRows=8;

var	maxBots=5;

var botAlive=[];
var botTimer=[];
var botX=[];
var botY=[];

var frame=0;

var gameLost=false;
var gameWon=false;

var imgWidth=32;
var imgHeight=32;

var kills=0;
var moves=0;

var player_x=0;
var player_y=0;

var	totalKills=0;
var totalPlays=0;
var totalWins=0;

var updateId=0;
var updateRate=33;

var grid=[];
var dirty=[];
var allowClicks=true;

function removeAllChildren(parent)
{
	while (parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild);
	}
}

function resetGrid()
{
	grid=new Array(numberOfColumns);
	dirty=new Array(numberOfColumns);

	for (var x=0 ; x < numberOfColumns ; x++) {
		grid[x]=new Array(numberOfRows);
		dirty[x]=new Array(numberOfRows);
		
		for (var y=0 ; y < numberOfRows ; y++) {
			grid[x][y]=0;
			if (x == 0 || x == numberOfColumns-1 || y == 0 || y == numberOfRows-1) {
				grid[x][y]=1;
			}
			dirty[x][y]=false;
		}
	}

	for (var b=0 ; b < numberOfBlocks ; b++) {
		var block_x=0;
		var block_y=0;
		do {
			block_x=Math.floor(Math.random()*numberOfColumns);
			block_y=Math.floor(Math.random()*numberOfRows);
		} while (grid[block_x][block_y] != 0);
		grid[block_x][block_y]=1;
	}

	botAlive=new Array(maxBots);
	botTimer=new Array(maxBots);
	bot_x=new Array(maxBots);
	bot_y=new Array(maxBots);

	for (var i=0 ; i < maxBots ; i++) {
		botAlive[i]=true;
		botTimer[i]=0;
		do {
			bot_x[i]=Math.floor(Math.random()*numberOfColumns);
			bot_y[i]=Math.floor(Math.random()*numberOfRows);
		} while (grid[bot_x[i]][bot_y[i]] != 0);
		grid[bot_x[i]][bot_y[i]]=5;
	}

	do {
		player_x=Math.floor(Math.random()*numberOfColumns);
		player_y=Math.floor(Math.random()*numberOfRows);
	} while (grid[player_x][player_y] != 0);
	grid[player_x][player_y]=3;

	kills=0;
}

function setup()
{
	resetGrid();
	
	var gridTable=document.getElementById('grid');
	removeAllChildren(gridTable);
	for (var y=0 ; y < numberOfRows ; y++) {
		var row=document.createElement('tr');
		for (var x=0 ; x < numberOfColumns ; x++) {
			var col=document.createElement('td');
			var img=document.createElement('img');
			img.setAttribute("onclick","click("+x+","+y+")");
			img.setAttribute("src","ball-"+grid[x][y]+".png");
			img.setAttribute("id",x+"_"+y);
			img.setAttribute("width",imgWidth);
			img.setAttribute("height",imgHeight);
			col.appendChild(img);
			row.appendChild(col);
		}
		gridTable.appendChild(row);
	}

	allowClicks=true;
	gameLost=false;
	gameWon=false;

	moves=0;

	updateStats();
}

function updateStats()
{
	var stats=document.getElementById('stats');
	if (gameWon) {
		stats.innerText="VICTORY!";
	}
	else if (gameLost) {
		stats.innerText="DEFEATED!";
	}
	else {
		var rating=((totalKills*(totalWins+1))/(totalPlays*maxBots)*100);
		var played=totalPlays-1;
//		if (played > 0) {
//			rating/=played;
//		}
		var rating_i=Math.floor(rating/100);
		var rating_r=Math.floor(rating%100);
		stats.innerText="Kills:"+totalKills+" Wins:"+totalWins+" Games:"+played+" Rating:"+rating_i+"."+rating_r;
	}
}

function createCookie(name,value,days)
{
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name)
{
	createCookie(name,"",-1);
}

function updateCookie()
{
	createCookie("kills",totalKills,365);
	createCookie("wins",totalWins,365);
	createCookie("plays",totalPlays,365);
}

function getCookie()
{
	var kills=readCookie("kills");
	if (kills != null) {
		totalKills=parseInt(kills);
	}
	var wins=readCookie("wins");
	if (wins != null) {
		totalWins=parseInt(wins);
	}
	var plays=readCookie("plays");
	if (plays != null) {
		totalPlays=parseInt(plays);
	}
}

function tick()
{
	updateBots();
	updateAllDirtyCells();
	updateStats();
	frame++;
}

function startTimer()
{
	//	set up tick interval of approximately 30fps
	if (updateId == 0) {
		updateId=window.setInterval(tick,updateRate);
	}
}

function stopTimer()
{
	if (updateId != 0) {
		window.clearInterval(updateId);
		updateId=0;
	}
}

function init()
{
	totalPlays=1;
	setup();
	getCookie();
	setTimeout(startTimer,250);
}

function reset()
{
	if (gameWon || gameLost) {
		setup();
	}
}

function pause()
{
	if (updateId != 0) {
		stopTimer();
	}
	else {
		startTimer();
	}
}

function playerLost()
{
	gameLost=true;
	totalPlays++;
	updateStats();
	updateCookie();
}

function playerWon()
{
	gameWon=true;
	totalWins++;
	totalPlays++;
	updateStats();
	updateCookie();
}

function setGrid(x,y,n)
{
	grid[x][y]=n;
	dirty[x][y]=true;
}

function updateCell(x,y)
{
    var newSrc;
	newSrc="ball-"+grid[x][y]+".png"
	document.images[x+"_"+y].src=newSrc;
}

function updateAllCells()
{
	for (var y=0 ; y < numberOfRows ; y++) {
		for (var x=0 ; x < numberOfColumns ; x++) {
			updateCell(x,y);
		}
	}
}

function updateAllDirtyCells()
{
	for (var y=0 ; y < numberOfRows ; y++) {
		for (var x=0 ; x < numberOfColumns ; x++) {
			if (dirty[x][y]) {
				updateCell(x,y);
				dirty[x][y]=false;
			}
		}
	}
}

function setBotTimers()
{
	var n=1;
	for (var i=0 ; i < maxBots ; i++) {
		if (botAlive[i]) {
			botTimer[i]=n*5;
			n++;
		}
	}
	allowClicks=false;
}

function updateBot(i)
{
	var x=bot_x[i];
	var y=bot_y[i];
	setGrid(x,y,0);
	if (x < player_x) {
		if (y == player_y) {
			if (grid[x+1][y] == 0) {
				x++;
			}
			else if (grid[x+1][y-1] == 0) {
				x++;
				y--;
			}
			else if (grid[x+1][y+1] == 0) {
				x++;
				y++;
			}
//			else if (grid[x][y-1] == 0) {
//				y--;
//			}
//			else if (grid[x][y+1] == 0) {
//				y++;
//			}
			else {
				x++;
			}
		}
		else if (y < player_y) {
			if (grid[x+1][y+1] == 0) {
				x++;
				y++;
			}
			else if (grid[x+1][y] == 0) {
				x++;
			}
			else if (grid[x][y+1] == 0) {
				y++;
			}
//			else if (grid[x+1][y-1] == 0) {
//				x++;
//				y--;
//			}
//			else if (grid[x][y-1] == 0) {
//				y--;
//			}
			else {
				x++;
				y++;
			}
		}
		else if (y > player_y) {
			if (grid[x+1][y-1] == 0) {
				x++;
				y--;
			}
			else if (grid[x+1][y] == 0) {
				x++;
			}
			else if (grid[x][y-1] == 0) {
				y--;
			}
//			else if (grid[x+1][y+1] == 0) {
//				x++;
//				y++;
//			}
//			else if (grid[x][y+1] == 0) {
//				y++;
//			}
			else {
				x++;
				y--;
			}
		}
	}
	else if (x > player_x) {
		if (y == player_y) {
			if (grid[x-1][y] == 0) {
				x--;
			}
			else if (grid[x-1][y-1] == 0) {
				x--;
				y--;
			}
			else if (grid[x-1][y+1] == 0) {
				x--;
				y++;
			}
//			else if (grid[x][y-1] == 0) {
//				y--;
//			}
//			else if (grid[x][y+1] == 0) {
//				y++;
//			}
			else {
				x--;
			}
		}
		else if (y < player_y) {
			if (grid[x-1][y+1] == 0) {
				x--;
				y++;
			}
			else if (grid[x-1][y] == 0) {
				x--;
			}
			else if (grid[x][y+1] == 0) {
				y++;
			}
//			else if (grid[x-1][y-1] == 0) {
//				x--;
//				y--;
//			}
//			else if (grid[x][y-1] == 0) {
//				y--;
//			}
			else {
				x--;
				y++;
			}
		}
		else if (y > player_y) {
			if (grid[x-1][y-1] == 0) {
				x--;
				y--;
			}
			else if (grid[x-1][y] == 0) {
				x--;
			}
			else if (grid[x][y-1] == 0) {
				y--;
			}
//			else if (grid[x-1][y+1] == 0) {
//				x--;
//				y++;
//			}
//			else if (grid[x][y+1] == 0) {
//				y++;
//			}
			else {
				x--;
				y--;
			}
		}
	}
	else if (x == player_x) {
		if (y < player_y) {
			if (grid[x][y+1] == 0) {
				y++;
			}
			else if (grid[x-1][y+1] == 0) {
				x--;
				y++;
			}
			else if (grid[x+1][y+1] == 0) {
				x++;
				y++;
			}
			else {
				y++;
			}
		}
		else if (y > player_y) {
			if (grid[x][y-1] == 0) {
				y--;
			}
			else if (grid[x+1][y-1] == 0) {
				x++;
				y--;
			}
			else if (grid[x-1][y-1] == 0) {
				x--;
				y--;
			}
			else {
				y--;
			}
		}
	}
	if (grid[x][y] == 0) {
		setGrid(x,y,5);
	}
	else {
		botAlive[i]=false;
		if (grid[x][y] == 1) {
			setGrid(x,y,2);
		}
		else if (grid[x][y] == 2) {
			setGrid(x,y,0);
		}
		totalKills++;
		kills++;
	}
	bot_x[i]=x;
	bot_y[i]=y;
}

function updateBots()
{
	if (gameWon || gameLost) {
		return;
	}
	var updates=0;
	grid[player_x][player_y]=0;
	for (var i=0 ; i < maxBots ; i++) {
		if (botTimer[i] > 0) {
			botTimer[i]--;
			if (botTimer[i] == 0) {
				updateBot(i);
			}
		}
		else {
			updates++;
		}
	}
	if (grid[player_x][player_y] == 0) {
		grid[player_x][player_y]=3;
	}
	else {
		playerLost();
	}
	if (kills == maxBots) {
		playerWon();
	}
	else if (updates == maxBots) {
		allowClicks=true;
	}
}

function jump()
{
	if (gameWon || gameLost) {
		return;
	}
	var old_x=player_x;
	var old_y=player_y;

	setGrid(player_x,player_y,0);

	var safe=false;
	if (Math.random()*1000 < 900) {
		safe=true;
	}
	if (moves == 0) {
		safe=true;
	}

	do {
		player_x=Math.floor(Math.random()*numberOfColumns);
		player_y=Math.floor(Math.random()*numberOfRows);
	} while ((safe && grid[player_x][player_y] != 0) || grid[player_x][player_y] == 5 || (player_x == old_x && player_y == old_y));
	if (grid[player_x][player_y] == 0) {
		setGrid(player_x,player_y,3);
	}
	else {
		setGrid(player_x,player_y,4);
		playerLost();
	}
}

function click(x,y)
{
	if (gameWon || gameLost) {
		return;
	}
	if (allowClicks) {
		if (Math.abs(player_x-x) <= 1 && Math.abs(player_y-y) <= 1) {
			if (grid[x][y] == 0) {
				setGrid(player_x,player_y,0);
				setGrid(x,y,3);
				player_x=x;
				player_y=y;
			}
			setBotTimers();
			moves++;
		}
	}
}