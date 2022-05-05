/////////////////////////////////////////////
//  4cm^2 canvas for drawing
//  From professor Xiang Chen's isketch example: https://github.com/ucla-hci/isketch.git
/////////////////////////////////////////////
var ISKETCH = ISKETCH || {}
ISKETCH.WIDTH = 50;
ISKETCH.HEIGHT = 50;

$(document).ready(() => {
    console.log('Welcome to iSketch!')

    // initialize the canvas
    $('#cvsMain')[0].width = ISKETCH.WIDTH;
    $('#cvsMain')[0].height = ISKETCH.HEIGHT;
    $('#cvsMain').css('background-color', '#eeeeee');
    ISKETCH.context = $('#cvsMain')[0].getContext('2d');
    ISKETCH.context.strokeStyle = "#df4b26";
    ISKETCH.context.lineJoin = "round";
    ISKETCH.context.lineWidth = 3;

    ISKETCH.context.font = "12px Arial";
    ISKETCH.drawSections();
	show_table();

    // add input event handlers
    $('#cvsMain').on('mousedown', ISKETCH.canvasMouseDown);
    $('#cvsMain').on('mousemove', ISKETCH.canvasMouseMove);
    $('#cvsMain').on('mouseup', ISKETCH.canvasMouseUp);

    //Initialize gesture recognizer
    ISKETCH.recognizer = new DollarRecognizer();
})

ISKETCH.drawSections = function(){
    //divide canvas into 4 sections by drawing 2 lines
    ISKETCH.context.strokeStyle = "#9C9C9C";
    ISKETCH.context.lineWidth = 1;
    ISKETCH.context.beginPath();
    ISKETCH.context.moveTo(ISKETCH.WIDTH/2,0);
    ISKETCH.context.lineTo(ISKETCH.WIDTH/2,ISKETCH.HEIGHT);
    ISKETCH.context.stroke();
    ISKETCH.context.moveTo(0,ISKETCH.HEIGHT/2);
    ISKETCH.context.lineTo(ISKETCH.WIDTH,ISKETCH.HEIGHT/2);
    ISKETCH.context.stroke();
    ISKETCH.context.closePath();
    ISKETCH.context.fillText("1", (ISKETCH.WIDTH/4 - 4), (ISKETCH.HEIGHT/4 + 4));
    ISKETCH.context.fillText("2", (3*ISKETCH.WIDTH/4 - 4), (ISKETCH.HEIGHT/4 + 4));
    ISKETCH.context.fillText("3", (ISKETCH.WIDTH/4 - 4), (3*ISKETCH.HEIGHT/4 + 4));
    ISKETCH.context.fillText("4", (3*ISKETCH.WIDTH/4 - 4), (3*ISKETCH.HEIGHT/4 + 4));
    ISKETCH.context.strokeStyle = "#df4b26";
    ISKETCH.context.lineWidth = 5;
}

ISKETCH.canvasMouseDown = function (e) {
    ISKETCH.context.clearRect(0, 0, $('#cvsMain').width(), $('#cvsMain').height());
    ISKETCH.drawSections();
    ISKETCH.context.beginPath();

    let rect = $('#cvsMain')[0].getBoundingClientRect();
    let x = e.clientX - rect.left, y = e.clientY - rect.top;
    ISKETCH.context.moveTo(x, y);
    ISKETCH.context.stroke();

    ISKETCH.isDragging = true;

    // create an empty array to store the user's mouse coordinates as Point objects
    // add the mouse down coordinates to this array
    ISKETCH.coords = [];
    ISKETCH.coords.push(new Point(x,y));
}

ISKETCH.canvasMouseMove = function (e) {
    if (!ISKETCH.isDragging) return;

    let rect = $('#cvsMain')[0].getBoundingClientRect();
    let x = e.clientX - rect.left, y = e.clientY - rect.top
    ISKETCH.context.lineTo(x, y);
    ISKETCH.context.moveTo(x, y);
    ISKETCH.context.stroke();

    // Add the mouse move coordinates to the array
    ISKETCH.coords.push(new Point(x,y));
}

ISKETCH.canvasMouseUp = function (e) {
    ISKETCH.isDragging = false;
    ISKETCH.context.closePath();

    // Add the mouse up coordinates to the array
    let rect = $('#cvsMain')[0].getBoundingClientRect();
    let x = e.clientX - rect.left, y = e.clientY - rect.top;
    ISKETCH.coords.push(new Point(x,y));

    // Print the array
    for(let i = 0; i < ISKETCH.coords.length; i++) {
        console.log(ISKETCH.coords[i].X + ", " + ISKETCH.coords[i].Y);
    }

    // Recognize the gesture
    var gesture = ISKETCH.recognizer.Recognize(ISKETCH.coords, true);
    //Write the gesture below the canvas
    document.getElementById('gesture').innerHTML = gesture.Name;

    //Act based on the recognized gesture:
    if(gesture.Name === "caret") {
        //speed up the board
		set_scroll_update_interval(UPDATE_INTERVAL-200);
    }
    else if(gesture.Name === "v") {
        //slow down the board
		set_scroll_update_interval(UPDATE_INTERVAL+200);
    }
    else if(gesture.Name === "circle") {
        //switch between emojis and text
		change_table();
    }
    else if(gesture.Name === "z") {
        //type sleepy face
		document.getElementById('message').innerHTML = document.getElementById('message').innerHTML + '&#128564';
    }
    else if(gesture.Name === "space") {
        //type space
		document.getElementById('message').append(' ');
    }
	else if(gesture.Name === "backspace") {
		//type backspace
		type_backspace();
	}
	else if(gesture.Name === "zigzag") {
		//type sad squiggly face
		document.getElementById('message').innerHTML = document.getElementById('message').innerHTML + '&#128534';
	}
	else if(gesture.Name == "smile") {
		//type happy face
		document.getElementById('message').innerHTML = document.getElementById('message').innerHTML + '&#128512';
	}
	else if(gesture.Name == "frown") {
		//type happy face
		document.getElementById('message').innerHTML = document.getElementById('message').innerHTML + '&#128542';
	}
    else if(gesture.Name === "No match.") {
        //If they drew a point input
		if(ISKETCH.coords.length <= 8) {
			document.getElementById('gesture').innerHTML = "Point";
			//check the location of the first point and type corresponding letter
			if(ISKETCH.coords[0].X < ISKETCH.WIDTH/2 && ISKETCH.coords[0].Y < ISKETCH.HEIGHT/2) {
				//bottom right
				typeLetter(0);
			}
			else if(ISKETCH.coords[0].X >= ISKETCH.WIDTH/2 && ISKETCH.coords[0].Y < ISKETCH.HEIGHT/2) {
				//top left
				typeLetter(1);
			}
			else if(ISKETCH.coords[0].X < ISKETCH.WIDTH/2 && ISKETCH.coords[0].Y >= ISKETCH.HEIGHT/2) {
				//top right
				typeLetter(2);
			}
			else if(ISKETCH.coords[0].X >= ISKETCH.WIDTH/2 && ISKETCH.coords[0].Y >= ISKETCH.HEIGHT/2) {
				//bottom left
				typeLetter(3);
			}
		}
    }
}
