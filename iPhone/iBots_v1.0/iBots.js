
/*
 
 File:iBots.js
 
 Abstract: JavaScript for the index.html file
 
 Version: <1.0>
 
 Copyright (C) 2007 Les Bird. All Rights Reserved.
 
*/ 
 
// Set up basic in-game variables

var numberOfBlocks=20;
var numberOfBots=5;
var numberOfColumns=10;
var numberOfRows=8;

var botIsAlive=[];
var bot_x=[];
var bot_y=[];

var gameLost=false;
var gameWon=false;

var imgWidth=32;
var imgHeight=32;

var moves=0;

var player_x=0;
var player_y=0;

var grid=[];
var dirty=[];
var allowClicks=true;

var kills=0;
var plays=-1;
var wins=0;
var rating=0;

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

	botIsAlive=new Array(numberOfBots);
	bot_x=new Array(numberOfBots);
	bot_y=new Array(numberOfBots);

	var enemy_x=0;
	var enemy_y=0;
	for (var i=0 ; i < numberOfBots ; i++) {
		do {
			enemy_x=Math.floor(Math.random()*numberOfColumns);
			enemy_y=Math.floor(Math.random()*numberOfRows);
		} while (grid[enemy_x][enemy_y] != 0);
		grid[enemy_x][enemy_y]=5;
		botIsAlive[i]=true;
		bot_x[i]=enemy_x;
		bot_y[i]=enemy_y;
	}

	do {
		player_x=Math.floor(Math.random()*numberOfColumns);
		player_y=Math.floor(Math.random()*numberOfRows);
	} while (grid[player_x][player_y] != 0);
	grid[player_x][player_y]=3;
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
		stats.innerText="Kills:"+kills+" Wins:"+wins+" Played:"+plays+" Rating:"+rating;
	}
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
			img.setAttribute("src","ball-"+grid[x][y]+".jpg");
			img.setAttribute("id",x+"_"+y);
			img.setAttribute("width",imgWidth);
			img.setAttribute("height",imgHeight);
			col.appendChild(img);
			row.appendChild(col);
		}
		gridTable.appendChild(row);
	}

	plays++;
	if (plays > 0) {
		rating=Math.floor((kills*100)/(plays*numberOfBots));
	}

	moves=0;

	allowClicks=true;
	gameLost=false;
	gameWon=false;

	updateStats();
}

function reset()
{
	if (gameWon || gameLost) {
		setup();
	}
}

function setGrid(x,y,n)
{
	grid[x][y]=n;
	dirty[x][y]=true;
}

function updateCell(x,y)
{
    var newSrc;
	newSrc="ball-"+grid[x][y]+".jpg"
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

function jump()
{
	if (gameWon || gameLost) {
		return;
	}
	setGrid(player_x,player_y,0);
	do {
		player_x=Math.floor(Math.random()*numberOfColumns);
		player_y=Math.floor(Math.random()*numberOfRows);
	} while ((moves == 0 && grid[player_x][player_y] != 0) || grid[player_x][player_y] == 5);
	if (grid[player_x][player_y] == 0) {
		setGrid(player_x,player_y,3);
	}
	else if (grid[player_x][player_y] == 1 || grid[player_x][player_y] == 2) {
		setGrid(player_x,player_y,4);
		gameLost=true;
		updateStats();
	}
	else {
		gameLost=true;
		updateStats();
	}
	updateAllDirtyCells();
}

function updateBot(i)
{
	if (botIsAlive[i]) {
		var x=bot_x[i];
		var y=bot_y[i];
		var mov_x=0;
		var mov_y=0;			
		if (x < player_x) {
			mov_x=1;
		}
		else if (x > player_x) {
			mov_x=-1;
		}
		if (y < player_y) {
			mov_y=1;
		}
		else if (y > player_y) {
			mov_y=-1;
		}
		var old_x=x;
		var old_y=y;
		if (grid[x+mov_x][y+mov_y] == 3) {
			gameLost=true;
			x=x+mov_x;
			y=y+mov_y;
		}
		else {
			if (grid[x+mov_x][y+mov_y] == 0) {
				x=x+mov_x;
				y=y+mov_y;
			}
			else if (grid[x+mov_x][y] == 0) {
				x=x+mov_x;
			}
			else if (grid[x][y+mov_y] == 0) {
				y=y+mov_y;
			}
			else {
				x=x+mov_x;
				y=y+mov_y;
				if (grid[x][y] == 1) {
					setGrid(x,y,2);
				}
				else if (grid[x][y] == 2) {
					setGrid(x,y,0);
				}
				botIsAlive[i]=false;
				kills++;
			}
		}
		setGrid(old_x,old_y,0);
		if (botIsAlive[i]) {
			setGrid(x,y,5);
		}
		bot_x[i]=x;
		bot_y[i]=y;
	}
}

function updateAllBots()
{
	for (var i=0 ; i < numberOfBots ; i++) {
		if (botIsAlive[i]) {
			updateBot(i);
		}
	}

	var bots_alive=0;
	for (var j=0 ; j < numberOfBots ; j++) {
		if (botIsAlive[j]) {
			bots_alive++;
		}
	}
	if (bots_alive == 0) {
		gameWon=true;
		wins++;
	}
}

function click(x, y)
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
			updateAllBots();
			updateStats();
			updateAllDirtyCells();
			moves++;
		}
	}
}