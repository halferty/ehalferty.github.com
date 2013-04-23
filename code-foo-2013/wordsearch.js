var highlighted_squares = [];

window.onload = function() {
	
	// Make a 2D array from the letter grid data
	lettergrid = lettergrid.map(function(value) {
		return value.split(/\t/);
	});
	
	// Create the words list
	$("#words").prepend("<div class='word'>" + searchwords.join("</div><div class='word'>") + "</div>");

	bind_events();
	
	// When the "Add new word" div is clicked, turn it into an edit box.
	$("#words .new").on("mousedown", function(event) {
		highlighted_squares = [];
		redraw_canvas();
		$(this).html("").attr("contenteditable", true);
		$(this).bind("keydown", function(e) {
			console.log(e.keyCode);
			
			// If the user presses enter, create a new div entry with the entered text.
			// Then insert it before the editable div.
			// Then make the editable div uneditable, and revert it to the instruction text.
			if (e.keyCode == 13) {
				e.preventDefault();
				if ($(this).html().length > 0 && $(this).html() != "Add new word") {
					$("#words .new").before("<div class='word'>" + $(this).html() + "</div>");
					bind_events();
				}
				
				// If the user has pressed enter and the editable div is empty, make
				// the div uneditable and revert back to the instruction text.
				$(this).html("Add new word");
				$(this).attr("contenteditable", false);
				$(this).unbind("keypress");
				
		// If the user presses escape, make the div uneditable and revert
		// back to the instruction text.
      	} else if (e.keyCode == 27) {
				$(this).html("Add new word").attr("contenteditable", false);
				$(this).unbind("keypress");
      	}
		});
	});

	redraw_canvas();
};

function bind_events() {
	// When the mouse is over a search word, do the search, and highlight the
	// search word div.
	$("#words .word").on("mouseenter", function(event) {
		find_word($(this).text().toLowerCase().replace(/\s/g, ""));
		$(this).css("background-color", "#c88");
	});
	
	// When the mouse leaves the search word div, dehighlight
	// all squares, dehighlight the div, and redraw.
	$("#words .word").on("mouseleave", function(event) {
		highlighted_squares = [];
		redraw_canvas();
		$(this).css("background-color", "#aae");
	});
}

// Find a given word, then set the highlighted squares to show it.
function find_word(word) {
	
	// Create a list of all locations matching the first letter
	var first_matched = [];
	lettergrid.forEach(function(row, y) {
		row.forEach(function(letter, x) {
			if (letter == word.charAt(0)) {
				first_matched.push([x, y]);
			}
		});
	});
	
	// Try directions on each location until a match is found.
	// The .every function will continue on each array value
	// until the callback returns false.
	first_matched.every(function(value) {
		return (
			(!test_match(value[0], value[1], "UP", word)) &&
			(!test_match(value[0], value[1], "DOWN", word)) &&
			(!test_match(value[0], value[1], "LEFT", word)) &&
			(!test_match(value[0], value[1], "RIGHT", word)) &&
			(!test_match(value[0], value[1], "UPLEFT", word)) &&
			(!test_match(value[0], value[1], "UPRIGHT", word)) &&
			(!test_match(value[0], value[1], "DOWNLEFT", word)) &&
			(!test_match(value[0], value[1], "DOWNRIGHT", word))
			);
	});
	redraw_canvas();
}

// Given a starting point, a direction, and a word to match, test if the word matches
// and set the highlighted squares accordingly.
function test_match(startx, starty, direction, word) {
	var i;
	var x_offset = 0;
	var y_offset = 0;
	var temp_highlight = [];
	for (i=0;i<word.length;i++) {
		
		// If a mismatch is found, return false.		
		if (word.charAt(i) != getSquare(startx + x_offset, starty + y_offset)) {
			return false;
		}
		
		// Add the square to a temporary list of squares that matched.	
		temp_highlight.push((startx + x_offset) + "," + (starty + y_offset));
		
		// Set the offset to the next square to check.
		if (direction == "UP") { y_offset--; }
		if (direction == "DOWN") { y_offset++; }
		if (direction == "LEFT") { x_offset--; }
		if (direction == "RIGHT") { x_offset++; }
		if (direction == "UPRIGHT") { y_offset--; x_offset++; }
		if (direction == "DOWNRIGHT") { y_offset++; x_offset++; }
		if (direction == "UPLEFT") { y_offset--; x_offset--; }
		if (direction == "DOWNLEFT") { y_offset++; x_offset--; }
	}
	
	// If no mismatches were found, and the end of the word has been reached,
	// set the highlighted squares to the temporary list, redraw the canvas,
	// and return true.
	highlighted_squares = temp_highlight;
	redraw_canvas();
	return true;
}

// Returns the value of a given square. If the location is out of
// bounds, return an empty string.
function getSquare(x, y) {
	if ((x < 0) || (x > lettergrid[0].length - 1) || (y < 0) || (y > lettergrid.length - 1)) {
		return "";
	} else {
		return lettergrid[y][x];
	}
}

function redraw_canvas() {
	
	// Get the canvas context
	canvas = document.getElementById("search");
	ctx = canvas.getContext("2d");
	
	// Clear the canvas
	ctx.fillStyle = "#ccc";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	// Draw the letter grid
	ctx.font = "16px courier new, monospace";
	ctx.fillStyle = "#000";
	lettergrid.forEach(function(line, y) {
		line.forEach(function(letter, x) {
			
			// Highlight the squares in the current word
			if (highlighted_squares.indexOf(x + "," + y) >= 0) {
				ctx.fillStyle = "#c88";
				ctx.fillRect(x * 18 + 3, y * 18 + 3, 14, 14);
				ctx.fillStyle = "#000";
			}
			ctx.fillText(letter, x * 18 + 5, y * 18 + 15);
		});
	});
}

var lettergrid = [
"x	n	t	g	j	h	e	a	l	t	h	u	s	k	b	w	a	s	t	a",
"s	o	u	j	y	n	z	w	x	b	t	g	m	v	y	b	o	l	a	h",
"h	t	i	l	t	s	l	e	q	d	c	r	a	n	d	r	p	x	z	b",
"p	s	h	e	p	b	n	o	r	e	b	a	z	o	o	k	a	s	b	u",
"l	i	d	n	o	l	y	p	r	v	a	s	j	p	p	j	o	s	r	d",
"i	e	v	y	r	u	m	g	b	e	l	s	g	r	y	l	h	c	x	z",
"a	h	m	h	o	n	k	i	l	l	t	a	c	u	l	a	r	o	b	y",
"b	o	i	e	q	d	o	n	s	y	b	s	o	t	x	o	g	r	a	p",
"h	o	w	i	t	e	u	z	a	t	y	s	e	d	o	b	f	e	v	s",
"a	i	s	c	a	r	k	a	e	i	d	i	s	i	c	h	i	o	p	t",
"o	d	b	a	d	b	o	h	d	r	y	n	y	l	e	v	e	l	a	e",
"l	d	k	u	i	u	j	i	r	e	g	s	d	a	s	q	a	b	g	v",
"d	i	u	c	b	s	t	a	d	l	k	l	h	y	a	s	p	i	l	e",
"v	o	j	c	i	s	h	j	g	o	d	y	o	o	m	g	o	l	d	s",
"w	r	i	l	k	d	b	g	l	a	y	i	r	i	s	t	g	x	g	m",
"l	t	s	c	r	a	g	a	h	d	e	s	d	q	b	a	h	w	d	o",
"h	e	a	l	t	i	r	n	o	f	u	y	e	a	l	w	y	e	h	m",
"f	m	u	s	h	r	o	o	m	e	h	a	p	p	i	n	d	r	t	o",
"l	h	f	h	p	y	o	n	u	k	a	c	o	l	a	o	r	e	b	v",
"p	a	r	e	l	z	d	d	k	a	p	r	o	t	o	m	a	n	p	l",
"m	j	o	p	o	u	y	o	m	l	q	u	a	l	i	n	l	d	w	y",
"w	a	p	a	n	y	r	r	r	j	y	o	a	h	z	n	i	x	e	m",
"m	l	s	r	i	w	h	f	t	i	n	o	g	r	o	l	s	e	y	s",
"l	y	l	d	n	i	k	u	o	y	d	l	u	o	w	u	k	d	e	o",
"o	y	o	q	y	a	k	d	j	e	b	l	u	n	d	e	r	s	c	u"
];

var searchwords = [
"Health",
"Score",
"Zerg",
"Assassin",
"Reload",
"Pylon",
"Level",
"Bazooka",
"Blunderbuss",
"Killtacular",
"Heist",
"Duck",
"Halo",
"Mushroom",
"Horde",
"Ganondorf",
"Protoman",
"Hydralisk",
"Shepard",
"NukaCola",
"Plasmid",
"Would you kindly",
"Metroid",
"Xin Zhao"
];
