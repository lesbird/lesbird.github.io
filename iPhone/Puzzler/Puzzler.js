
 /*
 
 File:Puzzler.js
 
 Abstract: JavaScript for the index.html file
 
 Version: <1.0>
 
 Disclaimer: IMPORTANT:  This Apple software is supplied to you by 
 Apple Inc. ("Apple") in consideration of your agreement to the
 following terms, and your use, installation, modification or
 redistribution of this Apple software constitutes acceptance of these
 terms.  If you do not agree with these terms, please do not use,
 install, modify or redistribute this Apple software.
 
 In consideration of your agreement to abide by the following terms, and
 subject to these terms, Apple grants you a personal, non-exclusive
 license, under Apple's copyrights in this original Apple software (the
 "Apple Software"), to use, reproduce, modify and redistribute the Apple
 Software, with or without modifications, in source and/or binary forms;
 provided that if you redistribute the Apple Software in its entirety and
 without modifications, you must retain this notice and the following
 text and disclaimers in all such redistributions of the Apple Software. 
 Neither the name, trademarks, service marks or logos of Apple Inc. 
 may be used to endorse or promote products derived from the Apple
 Software without specific prior written permission from Apple.  Except
 as expressly stated in this notice, no other rights or licenses, express
 or implied, are granted by Apple herein, including but not limited to
 any patent rights that may be infringed by your derivative works or by
 other works in which the Apple Software may be incorporated.
 
 The Apple Software is provided by Apple on an "AS IS" basis.  APPLE
 MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION
 THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND
 OPERATION ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
 
 IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION,
 MODIFICATION AND/OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED
 AND WHETHER UNDER THEORY OF CONTRACT, TORT (INCLUDING NEGLIGENCE),
 STRICT LIABILITY OR OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 
 Copyright (C) 2007 Apple Inc. All Rights Reserved.
 
 */ 
 
 // Set up basic in-game variables
// The number of columns (numberOfColumns) and rows (numberOfRows) of the game. 
//The grid array contains numbers ranging from 1 to 5, which represent the different ball images.
//The selected array contains either true or false. True indicates that the current cell is selected.
//The dirty array contains either true or false values. True indicates that the current cell contains a grey ball. 

var numberOfColumns = 7;
var numberOfRows = 7;

var grid = [];
var selected = [];
var dirty = [];
var allowClicks = true;


//Remove all elements of the grid
function removeAllChildren (parent)
{
	while (parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild);
	}
}

//Reset the grid
function resetGrid()
{

	grid = new Array(numberOfColumns);
	selected = new Array(numberOfColumns);
	dirty = new Array(numberOfColumns);
	
	for( var x = 0; x < numberOfColumns; x++ ) {
		grid[x] = new Array(numberOfRows);
		selected[x] = new Array(numberOfRows);
		dirty[x] = new Array(numberOfRows);
		
		for( var y = 0; y < numberOfRows; y++ ) {
			grid[x][y] = 1 + Math.floor(Math.random() * 5);
			selected[x][y] = false;
			dirty[x][y] = false;
		}
	}
}

//Set up the game on the page using DOM elements
function setup()
{
	resetGrid();
	
	var gridTable = document.getElementById('grid');
	removeAllChildren(gridTable);
	for( var y = 0; y < numberOfRows; y++ ) {
		var row = document.createElement('tr');
		for( var x = 0; x < numberOfColumns; x++ ) {
			var col = document.createElement('td');
			var img = document.createElement('img');
			img.setAttribute("onclick", "click("+x+","+y+")");
			img.setAttribute("src", "ball-"+grid[x][y]+".png");
			img.setAttribute("id", x+"_"+y);
			img.setAttribute("numberOfColumns", 32);
			img.setAttribute("numberOfRows", 32);
			img.setAttribute("width", 44);
			img.setAttribute("height", 44);
			col.appendChild(img);
			
			row.appendChild(col);
		}
		gridTable.appendChild(row);
	}
}

//Update image at position represented by (x,y)
function updateCell(x, y)
{
    var newSrc;
	if( selected[x][y] ){
        newSrc = "ball-sel.png";
    }    
    else {
        newSrc = "ball-"+grid[x][y]+".png"
    }    
        
	document.images[x+"_"+y].src = newSrc;
}


//Update all images on the grid
function updateAllCells()
{
	for( var y = 0; y < numberOfRows; y++ ) {
		for( var x = 0; x < numberOfColumns; x++ ) {
			updateCell(x, y);
		}
	}
}


function updateAllDirtyCells()
{
	for( var y = 0; y < numberOfRows; y++ ) {
		for( var x = 0; x < numberOfColumns; x++ ) {
			if( dirty[x][y] ) {
				updateCell(x, y);
				dirty[x][y] = false;
			}
		}
	}
}

function removeSelectedCells()
{

	for( var y = 0; y < numberOfRows; y++ ) {
		for( var x = 0; x < numberOfColumns; x++ ) {
			if( selected[x][y] ) {
				grid[x][y] = 0;
				selected[x][y] = false;
				dirty[x][y] = true;
			}
		}
	}
}


function fallDown()
{

    var fallTo,foundGap;
	for( var x = numberOfColumns-1; x >= 0; x-- ) {
		foundGap = false;
		for( var y = numberOfRows-1; y >= 0; y-- ) {
			if( grid[x][y] == 0 ) {
				if( ! foundGap ) {
					fallTo = y;
					foundGap = true;
				}
			}
			else { // grid occupied
				if( foundGap ) {
					grid[x][fallTo] = grid[x][y];
					grid[x][y] = 0;
					dirty[x][fallTo] = true;
					dirty[x][y] = true;
					fallTo -= 1;
				}
			}
		}
	}
}


function fallRight()
{

     var fallTo,foundGap;
	for( var y = numberOfRows-1; y >= 0; y-- ) {
	    foundGap = false;
		for( var x = numberOfColumns-1; x >= 0; x-- ) {
			if( grid[x][y] == 0 ) {
				if( ! foundGap ) {
					fallTo = x;
					foundGap = true;
				}
			}
			else { // grid occupied
				if( foundGap ) {
					grid[fallTo][y] = grid[x][y];
					grid[x][y] = 0;
					dirty[fallTo][y] = true;
					dirty[x][y] = true;
					fallTo -= 1;
				}
			}
		}
	}
}

function deselectAllCells()
{
	for( var y = 0; y < numberOfRows; y++ ) {
		for( var x = 0; x < numberOfColumns; x++ ) {
			if( selected[x][y] ) {
				selected[x][y] = false;
				dirty[x][y] = true;
			}
		}
	}
}

//Determines whether each of the 4 neighbors(top,bottom,left, and right) of a
//cell is equal to that current cell
function cellHasIdenticalNeighbour(x, y)
{
	var cell = grid[x][y];
	if( ( x+1 < numberOfColumns  && cell == grid[x+1][y] )
	 || ( x-1 >= 0     && cell == grid[x-1][y] )
	 || ( y+1 < numberOfRows && cell == grid[x][y+1] )
	 || ( y-1 >= 0     && cell == grid[x][y-1] ) ) {
		return true;
	}
	else {
		return false;
	}
}

//Select all contiguous cells of the same color
function selectCellAndContiguousCells(cell, x, y)
{
	if( x >= 0 && x < numberOfColumns && y >= 0 && y < numberOfRows ) {
		if( cell == grid[x][y] && ! selected[x][y] ) {
			selected[x][y] = true;
			dirty[x][y] = true;
			selectCellAndContiguousCells( cell, x+1, y );
			selectCellAndContiguousCells( cell, x-1, y );
			selectCellAndContiguousCells( cell, x, y+1 );
			selectCellAndContiguousCells( cell, x, y-1 );
		}
	}
}

function fallRightAndAllowClicks()
{
	fallRight();
	updateAllDirtyCells();
	allowClicks = true;
}


function fallDownThenFallRightAndAllowClicks()
{
	fallDown();
	updateAllDirtyCells();
    fallRightAndAllowClicks();

}

function click(x, y)
{
	// - if a given cell is selected:
	//   - remove all the selected cells
	//   - fall down
	//   - fall right
	//   - if the bottom-left cell is empty, add another (partial) column on the left and let it fall right
	// - if that cell is not selected, but is occupied:
	//   - deselect all cells
	//   - if there is an adjacent cell of the same color
	//     - select all contiguous cells of the same color
	
	if( ! allowClicks ){
		return;
	}	
	
	if( selected[x][y] ) {
		removeSelectedCells();
		updateAllDirtyCells();

		allowClicks = false;
		setTimeout("fallDownThenFallRightAndAllowClicks();", 100);
	}
	else if( grid[x][y] != 0 ) {
		deselectAllCells();
		if( cellHasIdenticalNeighbour( x, y ) ){
			selectCellAndContiguousCells( grid[x][y], x, y );
		}	
		updateAllDirtyCells();
	}
}