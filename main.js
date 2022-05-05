//////////////////////////////////////////////////////////////////////////////
//
//  Guitar Hero TinyType M2
//
//  main backend js, v0.0
//  by arthurlovekin@ucla.edu 04-30-2022
//  for ECE188 with professor Xiang Chen at UCLA
//
//////////////////////////////////////////////////////////////////////////////

var TINYTYPE = TINYTYPE || {} //TODO: Include namespace in functions below
var VISIBLE = 1; // determines which keyboard to display; 1=text, 2=emoji
var UPDATE_INTERVAL = 750; //ms

// Every dt milliseconds, scroll the alphabet down a letter
TINYTYPE.updatetimer = setInterval(scrollAlphabet, UPDATE_INTERVAL);

// move the bottom row of the table to the top row to simulate scrolling
function scrollAlphabet() {
    $("#TEXT-alphabet tr:nth-child(7)").insertBefore("#TEXT-alphabet tr:nth-child(1)");
	$("#EMOJI-alphabet tr:nth-child(7)").insertBefore("#EMOJI-alphabet tr:nth-child(1)");
}

function typeLetter(col) {
	//get letter from table
	if(VISIBLE === 1) {
		letter = document.getElementById('TEXT-alphabet').rows[5].cells[col].innerHTML;
	}
	else {
		letter = document.getElementById('EMOJI-alphabet').rows[5].cells[col].innerHTML;
	}

	//type letter
    if((letter === "~" || letter.codePointAt(0) === 128281)) {
		type_backspace();
	}
    else if(letter === '_') {
        document.getElementById('message').append(' ');
    } else {
        document.getElementById('message').append(letter);
    }
}

function type_backspace() {
	if($("#message").text().length > 0) {
		//if previous letter is emoji need to backspace twice; if it is alphabetic then backpace once
		prev_letter = $("#message").text().charAt($("#message").text().length-1);
		var regexletters = /^[A-Za-z ]+$/;
		if(prev_letter.match(regexletters)) {
			document.getElementById('message').innerHTML = document.getElementById('message').innerHTML.slice(0, -1);
		}
		else {
			document.getElementById('message').innerHTML = document.getElementById('message').innerHTML.slice(0, -2);
		}
	}
}

//Function to allow toggling between emoji and text tables
function change_table() {
    if(VISIBLE === 1) {
      VISIBLE = 2;
    } else {
      VISIBLE = 1;
    }
    show_table();
}

function show_table() {
	t1 = document.getElementById("TEXT-table");
	t2 = document.getElementById("EMOJI-table");
	if(VISIBLE === 1) {
		t1.style.display = 'block';
		//TODO: center table (I think the above messes up the og css)
		t1.style.margin = 'auto';
		t2.style.display = 'none';
	} else {
		t2.style.display = 'block';
		// t2.style.margin = 'auto';
		t1.style.display = 'none';
	}
}

function set_scroll_update_interval(ms) {
	if(ms > 50 && ms < 4000) {
		UPDATE_INTERVAL = ms;
		clearInterval(TINYTYPE.updatetimer);
		TINYTYPE.updatetimer = setInterval(scrollAlphabet, UPDATE_INTERVAL);
	}
}
