/*
 
 File:iTrek.js
 
 Abstract: JavaScript for the itrek.html file
 
 Version: <1.0>
 
 Copyright (C) 2007 Les Bird. All Rights Reserved.
 
*/ 
 
// Set up basic in-game variables

var numberOfQuadrants=8;
var numberOfSectors=10;

var	maxEnergy=5000;
var	maxKlingons=3;
var	maxShieldEnergy=2500;
var maxStars=10;
var	maxTorps=10;

var allowClicks=true;

var frame=0;

var	gameDate=3800;
var	gameKlingonCount=0;
var	gameKlingons=0;
var gameStarbases=0;
var	gameTimeLeft=0;

var gameLost=false;
var gameWon=false;

var imgWidth=24;
var imgHeight=24;

var kAlive=[];
var	kDamage=[];
var kEnergy=[];
var kTimer=[];
var kX=[];
var kY=[];

var	klingonEnergy=100;
var	klingonPhaPow=100;

var kills=0;

var	lineMovX=0;
var	lineMovY=0;

var moves=0;

var	navDx=0;
var navDy=0;
var	navSx=0;
var navSy=0;

var	playerCmdWar=1;
var	playerCmdPha=2;
var	playerCmdPhaAll=3;
var	playerCmdTor=4;
var	playerCmdLrs=5;

var	playerPhaPow=100;

var playerCmd=playerCmdWar;
var playerSx=0;
var playerSy=0;
var playerQx=0;
var playerQy=0;
var	playerUpdate=0;

var	shipCondGrn=1;
var	shipCondYel=2;
var	shipCondRed=3;
var	shipCondDoc=4;

var	shipCond=shipCondGrn;
var	shipDocked=false;
var	shipLifeStatus=1;
var	shipLifeTime=5;
var	shipWarp=1;
var	shipEnergy=maxEnergy;
var	shipTorps=maxTorps;
var	shipShieldStatus=0;
var	shipShieldEnergy=maxShieldEnergy;

var	targSx=-1;
var	targSy=-1;

var	turnTime=0.2;

var updateId=0;
var updateRate=33;

var grid=[];
var dirty=[];
var quad=[];
var	quadStat=[];

//
//
//

function removeAllChildren(parent)
{
	while (parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild);
	}
}

function resetGrid()
{
	gameKlingons=0;
	gameStarbases=0;

	quad=new Array(numberOfQuadrants);
	quadStat=new Array(numberOfQuadrants);

	var baseSectorCount=0;

	for (var qx=0 ; qx < numberOfQuadrants ; qx++) {
		quad[qx]=new Array(numberOfQuadrants);
		quadStat[qx]=new Array(numberOfQuadrants);
		for (var qy=0 ; qy < numberOfQuadrants ; qy++) {
			var k=0;
			if (Math.random() < 0.5) {
				k=Math.floor(Math.random()*maxKlingons)+1;
				gameKlingons+=k;
			}
			var s=Math.min(Math.floor(Math.random()*maxStars)+1,9);
			var b=Math.random();
			if (b > 0.8 && baseSectorCount > 10) {
				quad[qx][qy]=(k*100)+10+s;
				quadStat[qx][qy]=1;
				baseSectorCount=0;
				gameStarbases++;
			}
			else {
				quad[qx][qy]=(k*100)+s;
				quadStat[qx][qy]=0;
			}
			baseSectorCount++;
		}
	}

	gameTimeLeft=gameKlingons*2;

	playerQx=Math.floor(Math.random()*numberOfQuadrants);
	playerQy=Math.floor(Math.random()*numberOfQuadrants);
	playerSx=Math.floor(Math.random()*numberOfSectors);
	playerSy=Math.floor(Math.random()*numberOfSectors);

	buildQuadrant(playerQx,playerQy);

	if (quad[playerQx][playerQy] >= 100) {
		updateStatus("Entering quadrant "+(playerQx+1)+","+(playerQy+1)+". Condition RED!");
	}
	else {
		updateStatus("Entering quadrant "+(playerQx+1)+","+(playerQy+1)+".");
	}
}

function buildQuadrant(qx,qy)
{
	grid=new Array(numberOfSectors);
	dirty=new Array(numberOfSectors);

	for (var x=0 ; x < numberOfSectors ; x++) {
		grid[x]=new Array(numberOfSectors);
		dirty[x]=new Array(numberOfSectors);
		
		for (var y=0 ; y < numberOfSectors ; y++) {
			grid[x][y]=0;
			dirty[x][y]=false;
		}
	}

	kAlive=new Array(maxKlingons);
	kDamage=new Array(maxKlingons);
	kEnergy=new Array(maxKlingons);
	kTimer=new Array(maxKlingons);
	kX=new Array(maxKlingons);
	kY=new Array(maxKlingons);

	var q=quad[qx][qy];

	grid[playerSx][playerSy]=3;

	var klingons=Math.floor(q/100);
	for (var k=0 ; k < maxKlingons ; k++) {
		kAlive[k]=false;
		kDamage[k]=0;
		kEnergy[k]=klingonEnergy;
		kTimer[k]=0;
		kX[k]=0;
		kY[k]=0;
		if (k < klingons) {
			kAlive[k]=true;
			kEnergy[k]=klingonEnergy;
			var k_x=0;
			var k_y=0;
			do {
				k_x=Math.floor(Math.random()*numberOfSectors);
				k_y=Math.floor(Math.random()*numberOfSectors);
			} while (grid[k_x][k_y] != 0);
			grid[k_x][k_y]=5;
			kX[k]=k_x;
			kY[k]=k_y;
		}
	}

	q-=Math.floor(klingons*100);
	var bases=Math.floor(q/10);
	if (bases > 0) {
		var b_x=0;
		var b_y=0;
		do {
			b_x=Math.floor(Math.random()*numberOfSectors);
			b_y=Math.floor(Math.random()*numberOfSectors);
		} while (grid[b_x][b_y] != 0);
		grid[b_x][b_y]=4;
	}

	q-=Math.floor(bases*10);
	var stars=q;
	for (var s=0 ; s < maxStars ; s++) {
		if (s < stars) {
			var s_x=0;
			var s_y=0;
			do {
				s_x=Math.floor(Math.random()*numberOfSectors);
				s_y=Math.floor(Math.random()*numberOfSectors);
			} while (grid[s_x][s_y] != 0);
			if (Math.random() < 0.5) {
				grid[s_x][s_y]=1;
			}
			else {
				grid[s_x][s_y]=2;
			}
		}
	}

	for (var i=-1 ; i <= 1 ; i++) {
		for (var j=-1 ; j <= 1 ; j++) {
			if (qx+i >= 0 && qx+i < numberOfQuadrants) {
				if (qy+j >= 0 && qy+j < numberOfQuadrants) {
					quadStat[qx+i][qy+j]=1;
				}
			}
		}
	}

	gameKlingonCount=klingons;
}

function showMap()
{
	var gridTable=document.getElementById("gridBody");
	removeAllChildren(gridTable);
	for (var y=0 ; y < numberOfSectors ; y++) {
		var row=document.createElement("tr");
		for (var x=0 ; x < numberOfSectors ; x++) {
			var col=document.createElement("td");
			var img=document.createElement("img");
			img.setAttribute("onclick","click("+x+","+y+")");
			img.setAttribute("src","ball-"+grid[x][y]+".png");
			img.setAttribute("id",x+"_"+y);
			img.setAttribute("width",imgWidth);
			img.setAttribute("height",imgHeight);
			col.appendChild(img);
			row.appendChild(col);
		}

		if (y <= 8) {
			var l=document.createElement("div");
			l.align="left";
			l.className="item";
			l.style.fontFamily="courier";
			l.style.fontSize="small";
			l.style.borderLeft="8px";
			switch (y) {
			case 0:
				l.align="center";
				l.style.fontSize="medium";
				l.setAttribute("id","cond");
				l.innerText="GREEN";
				break;
			case 1:
				l.setAttribute("id","posi");
				l.innerText="Q:";
				break;
			case 2:
				l.setAttribute("id","date");
				l.innerText="D:";
				break;
			case 3:
				l.setAttribute("id","life");
				l.innerText="L:ACTIVE";
				break;
			case 4:
				l.setAttribute("id","ener");
				l.innerText="E:";
				break;
			case 5:
				l.setAttribute("id","torp");
				l.innerText="T:";
				break;
			case 6:
				l.setAttribute("id","shie");
				l.innerText="S:";
				break;
			case 7:
				l.setAttribute("id","klin");
				l.innerText="K:";
				break;
			case 8:
				l.setAttribute("id","time");
				l.innerText="DAYS:";
				break;
			}
			row.appendChild(l);
		}
		gridTable.appendChild(row);
	}
	updateStats();

	window.scrollTo(0,1);
}

function showGalaxy()
{
	updateStatus("Klingons:"+gameKlingons+" Days:"+Math.round(gameTimeLeft)+" Energy:"+Math.floor(shipEnergy));

	var gridTable=document.getElementById("gridBody");
	removeAllChildren(gridTable);

	for (var y=0 ; y < numberOfQuadrants ; y++) {
		var row=document.createElement("tr");
		for (var x=0 ; x < numberOfQuadrants ; x++) {
			var col=document.createElement("td");
			var l=document.createElement("div");
			l.align="center";
			l.style.fontFamily="courier";
			l.style.fontSize="small";
			l.style.borderTop="8px solid gray";
			l.style.borderBottom="8px solid gray";
			l.setAttribute("onclick","warpTo("+x+","+y+")");
			var q=0;
			if (quadStat[x][y] > 0) {
				q=quad[x][y];
				if (x == playerQx && y == playerQy) {
					l.style.color="black";
					l.style.backgroundColor="green";
				}
				else if (q >= 100) {
					l.style.color="white";
					l.style.backgroundColor="red";
				}
				else if (q >= 10) {
					l.style.color="white";
					l.style.backgroundColor="blue";
				}
				else {
					l.style.color="black";
					l.style.backgroundColor="white";
				}
			}
			else {
				l.style.color="white";
				l.style.backgroundColor="white";
			}
			var k=Math.floor(q/100);
			q-=(k*100);
			var b=Math.floor(q/10);
			q-=(b*10);
			var s=q;
			l.innerText="|"+k+""+b+""+s+"|";
			col.appendChild(l);
			row.appendChild(col);
		}
		gridTable.appendChild(row);
	}
}

function setup()
{
	resetGrid();
	showMap();

	allowClicks=true;
	gameLost=false;
	gameWon=false;

	kills=0;
	moves=0;
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

function updateStats()
{
	var l=null;
	var d1=Math.floor(gameDate);
	var d2=Math.floor((gameDate*10)%10);
	l=document.getElementById("date");
	l.innerText="D:"+d1+"."+d2;
	l=document.getElementById("posi");
	l.innerText="Q:"+(playerQx+1)+"-"+(playerQy+1);
	var e1=Math.floor(shipEnergy);
	var e2=Math.floor((shipEnergy*10)%10);
	l=document.getElementById("ener");
	l.innerText="E:"+e1+"."+e2;
	l=document.getElementById("torp");
	if (shipTorps == 0) {
		l.style.backgroundColor="red";
	}
	l.innerText="T:"+shipTorps;
	l=document.getElementById("klin");
	l.innerText="K:"+gameKlingons;
	var t1=Math.floor(gameTimeLeft);
	var t2=Math.floor((gameTimeLeft*10)%10);
	l=document.getElementById("time");
	l.innerText="DAYS:"+t1+"."+t2;
	updateCondition();
	updateLifeSupport();
	updateShieldStatus();
}

function updateCondition()
{
	if (quad[playerQx][playerQy] >= 100) {
		shipCond=shipCondRed;
	}
	else if (shipDocked == true) {
		shipCond=shipCondDoc;
	}
	else if (shipEnergy < 1000) {
		shipCond=shipCondYel;
	}
	else {
		shipCond=shipCondGrn;
	}
	if (shipCond == shipCondRed) {
		if (shipShieldEnergy > 0) {
			shipShieldStatus=1;
		}
	}
	else {
		shipShieldStatus=0;
	}
	var l=document.getElementById("cond");
	switch (shipCond) {
	case shipCondGrn:
		l.style.color="white";
		l.style.backgroundColor="green";
		l.innerText="GREEN";
		break;
	case shipCondYel:
		l.style.color="black";
		l.style.backgroundColor="yellow";
		l.innerText="YELLOW";
		break;
	case shipCondRed:
		l.style.color="white";
		l.style.backgroundColor="red";
		l.innerText="RED";
		break;
	case shipCondDoc:
		l.style.color="white";
		l.style.backgroundColor="blue";
		l.innerText="DOCKED";
		break;
	}
}

function updateLifeSupport()
{
	var l=document.getElementById("life");
	if (shipLifeStatus == 1) {
		l.innerText="L:ACTIVE";
	}
	else {
		l.style.backgroundColor="red";
		l.innerText="L:"+Math.floor(shipLifeTime)+"."+Math.floor((shipLifeTime*10)%10);
	}
}

function updateShieldStatus()
{
	var l=document.getElementById("shie");
	if (shipShieldEnergy == 0) {
		l.style.backgroundColor="red";
	}
	else if (shipShieldEnergy < 500) {
		l.style.backgroundColor="yellow";
	}
	else {
		l.style.color="black";
		l.style.backgroundColor="white";
	}
	l.innerText="S:"+shipShieldEnergy;
}

function saveGame()
{
//	createCookie("kills",totalKills,365);
//	createCookie("wins",totalWins,365);
//	createCookie("plays",totalPlays,365);
}

function loadGame()
{
//	var kills=readCookie("kills");
//	if (kills != null) {
//		totalKills=parseInt(kills);
//	}
//	var wins=readCookie("wins");
//	if (wins != null) {
//		totalWins=parseInt(wins);
//	}
//	var plays=readCookie("plays");
//	if (plays != null) {
//		totalPlays=parseInt(plays);
//	}
}

function setPlayerCmd(c)
{
	switch (c) {
	case playerCmdWar:
		break;
	case playerCmdPha:
		updateStatus("Phasers ready, sir.");
		break;
	case playerCmdPhaAll:
		updateStatus("Firing phasers!");
		break;
	case playerCmdTor:
		updateStatus("Torpedo armed, sir.");
		break;
	}
	playerCmd=c;
}

function tick()
{
	if (gameLost == true) {
		window.alert("The Federation has been conquered!");
		reset();
	}
	else if (gameWon == true) {
		window.alert("You have defeated the Klingons!");
		reset();
	}
	updatePlayer();
	updateKlingons();
	updateAllDirtyCells();
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
	setup();
	loadGame();
	setTimeout(startTimer,250);
}

function reset()
{
	if (gameWon == true || gameLost == true) {
		resetPlayer();
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
	updateStats();
}

function playerWon()
{
	gameWon=true;
	updateStats();
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
	for (var y=0 ; y < numberOfSectors ; y++) {
		for (var x=0 ; x < numberOfSectors ; x++) {
			updateCell(x,y);
		}
	}
}

function updateAllDirtyCells()
{
	for (var y=0 ; y < numberOfSectors ; y++) {
		for (var x=0 ; x < numberOfSectors ; x++) {
			if (dirty[x][y]) {
				updateCell(x,y);
				dirty[x][y]=false;
			}
		}
	}
}

function updateStatus(t)
{
	var p=document.getElementById("status");
	p.style.fontFamily="courier";
	p.style.fontSize="small";
	p.style.color="white";
	p.style.backgroundColor="gray";
	p.innerText=t;
}

function setKlingonTimers()
{
	var n=1;
	for (var i=0 ; i < maxKlingons ; i++) {
		if (kAlive[i] == true) {
			kTimer[i]=n*15;
			n++;
		}
	}
	allowClicks=false;
}

function updateKlingon(i)
{
	var x=kX[i];
	var y=kY[i];
	if (shipDocked == false) {
		var dir_x=kX[i]-playerSx;
		var dir_y=kY[i]-playerSy;
		var d=Math.sqrt((dir_x*dir_x)+(dir_y*dir_y))/2;
		if (d > 0) {
			var p=(Math.random()*klingonPhaPow)+(klingonPhaPow/2);
			var damage=Math.round(p/d);
			if (damage > 0) {
				if (shipShieldEnergy > 0 && shipShieldStatus != 0) {
					shipShieldEnergy-=damage;
					if (shipShieldEnergy < 0) {
						shipEnergy+=shipShieldEnergy;
						shipShieldEnergy=0;
					}
				}
				else {
					shipEnergy-=damage;
					if (Math.random() > 0.9) {
						if (shipLifeStatus == 1) {
							shipLifeStatus=0;
							shipLifeTime=(Math.random()*8)+2;
							updateLifeSupport();
							updateStatus("Life support damaged. "+shipLifeTime+" days remain.");
						}
					}
				}
				if (shipEnergy <= 0) {
					playerLost();
				}
				else {
					kDamage[i]=damage;
					updateStats();
				}
			}
		}
	}
}

function updateKlingons()
{
	if (gameWon == true || gameLost == true) {
		return;
	}

	var updates=0;
	for (var i=0 ; i < maxKlingons ; i++) {
		var x=kX[i];
		var y=kY[i];
		if (kTimer[i] > 0) {
			kTimer[i]--;
			if (kTimer[i] == 0) {
				setGrid(x,y,5);
				updateKlingon(i);
			}
			else {
				if (updates == i) {
					if (grid[x][y] == 5) {
						setGrid(x,y,0);
					}
					else {
						setGrid(x,y,5);
					}
				}
			}
		}
		else {
			updates++;
		}
	}
	if (updates == maxKlingons) {
		showSummaryPlayer();
		allowClicks=true;
	}
}

function moveTo(x1,y1,x2,y2)
{
	var dir_x=x2-x1;
	var adir_x=Math.abs(dir_x);
	var dir_y=y2-y1;
	var adir_y=Math.abs(dir_y);
	if (adir_x == adir_y) {	//	diagonal
		if (dir_x < 0) {
			dir_x=-1;
		}
		else if (dir_x > 0) {
			dir_x=1;
		}
		if (dir_y < 0) {
			dir_y=-1;
		}
		else if (dir_y > 0) {
			dir_y=1;
		}
		lineMovX=dir_x;
		lineMovY=dir_y;
	}
	else if (dir_x != 0 && dir_y != 0) {	//	angled
		if (adir_x > adir_y) {
			dir_y=dir_y/adir_x;
			if (dir_x < 0) {
				dir_x=-1;
			}
			else {
				dir_x=1;
			}
		}
		else {
			dir_x=dir_x/adir_y;
			if (dir_y < 0) {
				dir_y=-1;
			}
			else {
				dir_y=1;
			}
		}
		lineMovX=dir_x;
		lineMovY=dir_y;
	}
	else if (dir_x == 0) {	//	straight path
		if (dir_y < 0) {
			dir_y=-1;
		}
		else {
			dir_y=1;
		}
		lineMovX=0;
		lineMovY=dir_y;
	}
	else {					//	straight path
		if (dir_x < 0) {
			dir_x=-1;
		}
		else {
			dir_x=1;
		}
		lineMovY=0;
		lineMovX=dir_x;
	}
	var t=(Math.abs(lineMovX)+Math.abs(lineMovY))/10;
	passTime(t);
}

function moveEnd()
{
	lineMovX=0;
	lineMovY=0;
}

function drainEnergy(p)
{
	if (shipCond != shipCondDoc) {
		shipEnergy-=p;
		if (shipEnergy <= 0) {
			shipEnergy=0;
		}
		if (shipEnergy == 0) {
			playerLost();
		}
	}
}

function killKlingon(i)
{
//	gameTimeLeft+=0.5;
	quad[playerQx][playerQy]-=100;
	gameKlingons--;
	gameKlingonCount--;
	if (gameKlingons == 0) {
		playerWon();
	}
	kAlive[i]=false;
}

function killKlingonAt(x,y)
{
	for (i=0 ; i < maxKlingons ; i++) {
		if (kX[i] == x && kY[i] == y) {
			killKlingon(i);
			return;
		}
	}
}

function firePhasers(x,y,p)
{
	var k=0;
	var power=(Math.random()*p)+(p/2);
	for (var i=0 ; i < maxKlingons ; i++) {
		if (kAlive[i] == true) {
			if (kX[i] == x && kY[i] == y) {
				var dir_x=x-playerSx;
				var dir_y=y-playerSy;
				var d=(Math.sqrt((dir_x*dir_x)+(dir_y*dir_y))/3);
				if (d > 0) {
					var damage=Math.round(power/d);
					kEnergy[i]-=damage;
					if (kEnergy[i] <= 0) {
						killKlingon(i);
						setGrid(x,y,0);
						k++;
					}
					if (kAlive[i] == true) {
						kDamage[i]=damage;
					}
					else {
						kDamage[i]=damage;
					}
				}
				return;
			}
		}
	}
}

function updatePlayer()
{
	if (shipDocked) {
		if (playerUpdate >= 6) {
			if (shipEnergy < maxEnergy) {
				shipEnergy+=500;
				if (shipEnergy > maxEnergy) {
					shipEnergy=maxEnergy;
				}
				passTime(turnTime);
				updateStats();
				playerUpdate=0;
			}
			else if (shipShieldEnergy < maxShieldEnergy) {
				shipShieldEnergy+=500;
				if (shipShieldEnergy > maxShieldEnergy) {
					shipShieldEnergy=maxShieldEnergy;
				}
				passTime(turnTime);
				updateStats();
				playerUpdate=0;
			}
			else if (shipTorps < maxTorps) {
				shipTorps=maxTorps;
				passTime(turnTime);
				updateStats();
				playerUpdate=0;
			}
		}
	}

	switch (playerCmd) {
	case playerCmdWar:
		if (lineMovX != 0 || lineMovY != 0) {
			if (playerUpdate >= 6) {
				shipDocked=false;
				moveTo(playerSx,playerSy,navDx,navDy);
				navSx+=lineMovX;
				navSy+=lineMovY;
				var x=Math.min(Math.max(Math.floor(navSx),0),numberOfSectors-1);
				var y=Math.min(Math.max(Math.floor(navSy),0),numberOfSectors-1);
				if (grid[x][y] == 0 || grid[x][y] == 3) {
					setGrid(playerSx,playerSy,0);
					setGrid(x,y,3);
					playerSx=x;
					playerSy=y;
				}
				else {
					if (grid[x][y] < 3) {
						updateStatus("Blocked by star at "+(x+1)+","+(y+1));
					}
					else if (grid[x][y] == 5) {
						updateStatus("Blocked by Klingon at "+(x+1)+","+(y+1));
					}
					else {
						dockPlayer();
						updateStatus("Docked with Starbase at "+(x+1)+","+(y+1));
						shipDocked=true;
					}
					navDx=playerSx;
					navDy=playerSy;
				}
				if (playerSx == navDx && playerSy == navDy) {
					moveEnd();
					updateStats();
					setKlingonTimers();
				}
				playerUpdate=0;
			}
		}
		break;
	case playerCmdPha:
		if (targSx != -1 && targSy != -1) {
			if (playerUpdate >= 6) {
				passTime(turnTime);
				firePhasers(targSx,targSy,playerPhaPow);
				drainEnergy(playerPhaPow);
				updateStats();
				showSummaryKlingons();
				setKlingonTimers();
				setPlayerCmd(playerCmdWar);
				targSx=-1;
				targSy=-1;
			}
		}
		break;
	case playerCmdPhaAll:
		if (playerUpdate >= 6) {
			var t=gameKlingonCount*turnTime;
			passTime(t);
			var p=0;
			if (gameKlingonCount > 0) {
				p=playerPhaPow/gameKlingonCount;
				for (var i=0 ; i < maxKlingons ; i++) {
					firePhasers(kX[i],kY[i],p);
				}
				drainEnergy(playerPhaPow);
				updateStats();
				showSummaryKlingons();
			}
			setKlingonTimers();
			setPlayerCmd(playerCmdWar);
		}
		break;
	case playerCmdTor:
		if (lineMovX != 0 || lineMovY != 0) {
			if (playerUpdate >= 6) {
				var sx=Math.floor(navSx);
				var sy=Math.floor(navSy);
				if (grid[sx][sy] == 6) {
					setGrid(sx,sy,0);
				}
//				moveTo(sx,sy,navDx,navDy);
				navSx+=lineMovX;
				navSy+=lineMovY;
				var x=Math.floor(navSx);
				var y=Math.floor(navSy);
				var missed=false;
				if (x < 0 || x >= numberOfSectors || y < 0 || y >= numberOfSectors) {
					missed=true;
					navDx=sx;
					navDy=sy;
				}
				else if (grid[x][y] == 0) {
					setGrid(x,y,6);
					navDx=x+lineMovX;
					navDy=y+lineMovY;
				}
				else if (grid[x][y] != 3) {
					if (grid[x][y] == 5) {
						setGrid(x,y,0);
						killKlingonAt(x,y);
						updateStatus("Klingon at "+(x+1)+","+(y+1)+" DESTROYED!");
					}
					else if (grid[x][y] < 3) {
						setGrid(x,y,0);
						quad[playerQx][playerQy]-=10;
						updateStatus("Star at "+(x+1)+","+(y+1)+" DESTROYED!");
					}
					else if (grid[x][y] == 4) {
						setGrid(x,y,0);
						quad[playerQx][playerQy]-=1;
						updateStatus("Starbase DESTROYED!");
					}
					else {
						missed=true;
					}
					navDx=sx;
					navDy=sy;
				}
				if (sx == navDx && sy == navDy) {
					moveEnd();
					updateStats();
					setKlingonTimers();
					setPlayerCmd(playerCmdWar);
				}
				if (missed == true) {
					updateStatus("Torpedo missed!");
				}
				playerUpdate=0;
			}
		}
		break;
	}
	playerUpdate++;
}

function resetPlayer()
{
	shipEnergy=maxEnergy;
	shipShieldEnergy=maxShieldEnergy;
	shipTorps=maxTorps;
	shipLifeStatus=1;
	shipLifeTime=0;
}

function dockPlayer()
{
	shipLifeStatus=1;
	shipLifeTime=0;
}

function phasers()
{
	if (playerCmd == playerCmdPha) {
		setPlayerCmd(playerCmdPhaAll);
		playerUpdate=0;
	}
	else {
		setPlayerCmd(playerCmdPha);
	}
}

function torpedos()
{
	if (playerCmd == playerCmdTor) {
		updateStatus("Command aborted, sir.");
		setPlayerCmd(playerCmdWar);
	}
	else if (shipTorps > 0) {
		setPlayerCmd(playerCmdTor);
	}
}

function lrscan()
{
	var e=document.getElementById("lrscanbutton");
	if (e.value == "Warp") {
		showGalaxy();
		e.value="Scan";
	}
	else {
		updateStatus("Quadrant:"+(playerQx+1)+","+(playerQy+1)+" Sector:"+(playerSx+1)+","+(playerSy+1));
		showMap();
		e.value="Warp";
	}
}

function click(x,y)
{
	if (gameWon == true || gameLost == true) {
		return;
	}
	if (allowClicks) {
		if (playerCmd != 0) {
			switch (playerCmd) {
			case playerCmdWar:
				if (grid[x][y] == 0 || grid[x][y] == 4) {
					navSx=playerSx;
					navSy=playerSy;
					navDx=x;
					navDy=y;
					moveTo(navSx,navSy,navDx,navDy);
				}
				else {
					setPlayerCmd(playerCmdWar);
				}
				break;
			case playerCmdPha:
				if (grid[x][y] == 5) {
					targSx=x;
					targSy=y;
				}
				else {
					setPlayerCmd(playerCmdWar);
					updateStatus("Command aborted, sir.");
				}
				break;
			case playerCmdPhaAll:
				break;
			case playerCmdTor:
				updateStatus("Torpedo away!");
				navSx=playerSx;
				navSy=playerSy;
				navDx=x;
				navDy=y;
				if (navDx < navSx) {
					lineMovX=-1;
				}
				else if (navDx > navSx) {
					lineMovX=1;
				}
				else {
					lineMovX=0;
				}
				if (navDy < navSy) {
					lineMovY=-1;
				}
				else if (navDy > navSy) {
					lineMovY=1;
				}
				else {
					lineMovY=0;
				}
				shipTorps--;
				break;
			}
			playerUpdate=0;
		}
	}
}

function warpTo(x,y)
{
	shipDocked=false;
	var dir_x=x-playerQx;
	var dir_y=y-playerQy;
	var d=Math.sqrt((dir_x*dir_x)+(dir_y*dir_y));
	passTime(d);
	var p=d*100;
	drainEnergy(p);
	playerQx=x;
	playerQy=y;
	buildQuadrant(x,y);
	lrscan();
	if (quad[x][y] >= 100) {
		updateStatus("Entering quadrant "+(x+1)+","+(y+1)+". Condition RED!");
	}
	else {
		updateStatus("Entering quadrant "+(x+1)+","+(y+1)+".");
	}
}

function passTime(t)
{
	gameDate+=t;
	gameTimeLeft-=t;
	if (gameTimeLeft <= 0) {
		gameTimeLeft=0;
		playerLost();
	}
	if (shipLifeStatus == 0) {
		shipLifeTime-=t;
		if (shipLifeTime <= 0) {
			shipLifeTime=0;
			playerLost();
		}
	}
}

function showSummaryKlingons()
{
	var kills=0;
	var total=0;
	for (var i=0 ; i < maxKlingons ; i++) {
		if (kDamage[i] != 0) {
			if (kAlive[i] == false) {
				kills++;
			}
			total+=kDamage[i];
			kDamage[i]=0;
		}
	}
	if (total != 0) {
		if (kills > 0) {
			updateStatus("Damage to Klingon(s): "+total+" - "+kills+" DESTROYED!");
		}
		else {
			updateStatus("Damage to Klingon(s): "+total);
		}
	}
}

function showSummaryPlayer()
{
	var total=0;
	for (var i=0 ; i < maxKlingons ; i++) {
		if (kDamage[i] != 0) {
			total+=kDamage[i];
			kDamage[i]=0;
		}
	}
//	if (total != 0) {
//		updateStatus("Total damage from Klingon(s): "+total);
//	}
}
