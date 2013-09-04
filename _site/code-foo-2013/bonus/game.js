// Game state
var level = 0;
var enemy_shift_dir;
var enemy_shift_loc = 0;
var HP = 100;
var lives = 3;
var score = 0;
var hiscore = 0;
var game_started = false;
var fire_cooldown = 0;
var level_start_time = new Date();
var alert_played_this_blink = false;

Game = {
	start: function() {
		Crafty.init(640, 480);
		Crafty.background("url(assets/background.png)");
		
		// Setup game state
		enemy_shift_dir = (Crafty.math.randomInt(0, 1) == 1)? "left" : "right";
		
		//turn the sprite maps into usable components
		Crafty.sprite(32, "assets/sprites/pink_enemy.png", { pink_enemy: [0, 0] });
		Crafty.sprite(32, "assets/sprites/red_enemy.png", { red_enemy: [0, 0] });
		Crafty.sprite(32, "assets/sprites/orange_enemy.png", { orange_enemy: [0, 0] });
		Crafty.sprite(32, "assets/sprites/ship.png", { ship: [0, 0] });
		Crafty.sprite(32, "assets/sprites/explosion_procedurally_generated.png", { explosion: [0, 0] });
		
		create_enemy_grid();
		Crafty.audio.add({
        	laser: [
        		"assets/sounds/151022__bubaproducer__laser-shot-silenced.wav",
        		"assets/sounds/151022__bubaproducer__laser-shot-silenced.mp3",
        		"assets/sounds/151022__bubaproducer__laser-shot-silenced.ogg"
        		],
        	explosion: [
        		"assets/sounds/110115__ryansnook__small-explosion.wav",
        		"assets/sounds/110115__ryansnook__small-explosion.mp3",
        		"assets/sounds/110115__ryansnook__small-explosion.ogg"
        		],
        	alert: [
        		"assets/sounds/26777__junggle__btn402.wav",
        		"assets/sounds/26777__junggle__btn402.mp3",
        		"assets/sounds/26777__junggle__btn402.ogg"
        		],
        	die: [
        		"assets/sounds/66692__mad-monkey__power06.wav",
        		"assets/sounds/66692__mad-monkey__power06.mp3",
        		"assets/sounds/66692__mad-monkey__power06.ogg"
        		],
        	nextLevel: [
        		"assets/sounds/178350__andromadax24__s-teleport-05.wav",
        		"assets/sounds/178350__andromadax24__s-teleport-05.mp3",
        		"assets/sounds/178350__andromadax24__s-teleport-05.ogg"
        		],
        		
        		
        });
        
		
		// An entity to keep track of general per-frame things.
		Crafty.e("nothing").bind('EnterFrame', function () {
			
			// Move the grid of enemies back and forth.
			if (enemy_shift_dir == "left") {
				enemy_shift_loc -= 0.1;
				if (enemy_shift_loc < -100) {
					enemy_shift_dir = "right";
				}
			} else {
				enemy_shift_loc += 0.1;
				if (enemy_shift_loc > 100) {
					enemy_shift_dir = "left";
				}
			}
			
			// Check if we are dead.
			if (HP < 1) {
				
				// Game over
				if (lives == 1) {
					game_started = false;
					Crafty.e("GameOverText, 2D, DOM, Text").attr({ x: 120, y: 224, w: 400, h: 32 }).css(text_css)
						.css({"color": "red", "font-size": "32px" })
			            .text("GAME OVER");
					Crafty.pause();
				} else {
					
					lives--;
					HP = 100;
					Crafty("ship").attr({ x: 304, y: 450, w: 32, h: 32 });
			    	Crafty.audio.play("die");
				}
			}
			
			// Check if all enemies are dead.
			if ((Crafty("pink_enemy").length +
				Crafty("red_enemy").length +
				Crafty("orange_enemy").length) == 0 &&
				game_started == true) {
					var bonus = 30000 - (new Date() - level_start_time);
					if (bonus > 0) score += bonus;
					next_level();
			}
			
			// Update the game status bar.
			Crafty("Lives").each(function () { this.text(pad_text(lives, 2)) });
			Crafty("Health").each(function () {this.attr({ w: HP }); });
			Crafty("Level").each(function () { this.text(pad_text(level, 2)) });
			Crafty("Score").each(function () { this.text(pad_text(score, 7)) });
			Crafty("Hiscore").each(function () { this.text(pad_text(hiscore, 7)) });
			
			// Delete explosions that are done playing.
			Crafty("explosion").each(function () { if (!this.isPlaying()) this.destroy(); });
			
			if (((new Date()) - level_start_time) < 20000) {
				var count = 20 - (((new Date()) - level_start_time)/1000);
				var seconds = Math.floor(count);
				Crafty("10XBonusLabel").attr({ "visible": true });
				if ((count - seconds) < 0.5) {
					alert_played_this_blink = false;
					Crafty("10XBonus").attr({ "visible": false });
				} else {
					if (!alert_played_this_blink && (seconds < 10) && (level == 0)) {
						alert_played_this_blink = true;
			    		Crafty.audio.play("alert", 1, (10 - seconds) * 0.05);
					}
					Crafty("10XBonus").attr({ "visible": true });
				}
				Crafty("10XBonus").each(function () { this.text(seconds + " SECONDS"); });
			} else {
				Crafty("10XBonusLabel").attr({ "visible": false });
				Crafty("10XBonus").attr({ "visible": false });
			}
			
		});
		
		// Ship
		Crafty.e("ship, 2D, DOM, ship, Multiway")
			.attr({ x: 304, y: 450, w: 32, h: 32 })
			.multiway(10, { LEFT_ARROW: 180, RIGHT_ARROW: 0 })
			.bind('EnterFrame', function () {
				if (this.x > 608) this.x = 608;
				if (this.x < 0) this.x = 0;
			})
			.bind('KeyDown', function(e) {
		    
			    // Fire lasers
			    if(e.key == Crafty.keys['SPACE']) {
			    	if (((new Date()) - fire_cooldown) > 250) {
			    		Crafty.audio.play("laser");
			    		fire_cooldown = new Date();
			    		for (var i = 0; i < 2; i++) {
							Crafty.e("laser, 2D, DOM, Color, Collision")
								.attr({ x: this.x + 8 + (i * 16), y: this.y + 8, w: 3, h: 8})
								.color("blue")
								.bind('EnterFrame', function () {
									this.y -= 6;
									if (this.y < -50) {
										this.destroy();
									}
								})
								.onHit('pink_enemy', function (o) { this.destroy(); kill_enemy(o[0].obj); })
								.onHit('red_enemy', function (o) { this.destroy(); kill_enemy(o[0].obj); })
								.onHit('orange_enemy', function (o) { this.destroy(); kill_enemy(o[0].obj); });
						}
				    }
			    }
			});
		
		
		// Game status text
		var text_css = { "text-align": "center", "font-family": "PressStart2P", "font-size": "12px" }
		Crafty.e("2D, DOM, Text").attr({ x: 0, y: 0, w: 100, h: 12 }).css(text_css)
            .text("HISCORE");
            
		Crafty.e("Hiscore, 2D, DOM, Text").attr({ x: 0, y: 13, w: 100, h: 12 }).css(text_css)
            .text("0");
            
		Crafty.e("2D, DOM, Text").attr({ x: 100, y: 0, w: 100, h: 12 }).css(text_css)
            .text("SCORE");
            
		Crafty.e("Score, 2D, DOM, Text").attr({ x: 100, y: 13, w: 100, h: 12 }).css(text_css)
            .text("0");
            
		Crafty.e("2D, DOM, Text").attr({ x: 200, y: 0, w: 100, h: 12 }).css(text_css)
            .text("LEVEL");
            
		Crafty.e("Level, 2D, DOM, Text").attr({ x: 200, y: 13, w: 100, h: 12 }).css(text_css)
            .text("1");
            
		Crafty.e("2D, DOM, Text").attr({ x: 300, y: 0, w: 100, h: 12 }).css(text_css)
            .text("LIVES");
            
		Crafty.e("Lives, 2D, DOM, Text").attr({ x: 300, y: 13, w: 100, h: 12 }).css(text_css)
            .text("10");
            
		Crafty.e("2D, DOM, Text").attr({ x: 400, y: 0, w: 100, h: 12 }).css(text_css)
            .text("HEALTH");
            
		Crafty.e("2D, DOM").attr({ x: 400, y: 13, w: 100, h: 12 })
			.css({ "border-width": "2px", "background": "red" });
            
		Crafty.e("Health, 2D, DOM").attr({ x: 400, y: 13, w: 100, h: 12 })
			.css({ "background": "green" });
            
		Crafty.e("10XBonusLabel, 2D, DOM, Text").attr({ x: 500, y: 0, w: 150, h: 12 }).css(text_css)
            .text("10X BONUS");
            
		Crafty.e("10XBonus, 2D, DOM, Text").attr({ x: 500, y: 13, w: 150, h: 12 }).css(text_css)
			.css({ "color": "red" })
            .text("10 SECONDS");
            
		game_started = true;
	}
}

function create_explosion(x, y) {
	Crafty.audio.play("explosion", 1, 0.15);
	Crafty.e("explosion, 2D, DOM, SpriteAnimation")
		.attr({ x: x, y: y, w: 32, h: 32 })
		.animate("boom", 0, 0, 9)
		.animate("boom", Crafty.math.randomInt(10, 80));
}

function next_level() {
	Crafty("laser").each(function () { this.destroy(); });
	Crafty("pink_enemy").each(function () { this.destroy(); });
	Crafty("red_enemy").each(function () { this.destroy(); });
	Crafty("orange_enemy").each(function () { this.destroy(); });
	level++;
	create_enemy_grid();
	level_start_time = new Date();
	Crafty.audio.play("nextLevel");
	HP = 100;
}

function kill_enemy(o) {
	var x = o.x, y = o.y;
	var enemy_name = o._element.className.split(" ")[0];
	var value = 0;
	if (enemy_name == "pink_enemy") {
		value = 10;
	} else if (enemy_name == "red_enemy") {
		value = 25;
	} else if (enemy_name == "orange_enemy") {
		value = 50;
	}
	if (((new Date()) - level_start_time) < 10000) {
		value *= 10;
	}
	score += value;
	o.destroy();
	create_explosion(x, y);
}

// Create the grid of enemies.
function create_enemy_grid() {
	enemy_shift_loc = 0;
	for (var row = 0; row < 6; row++) {
		for (var col = 0; col < 10; col++) {
			var x = 120 + col * 40, y = 30 + row * 36;
			var r = enemy_configurations[level][row];
			var type = r.split("")[col];
			
			// Enemy type 1: Cannon fodder.
			if (type == "1") {
				Crafty.e("pink_enemy, 2D, DOM, SpriteAnimation, Collision")
				.attr({ x: x, y: y, w: 32, h: 32})
				.bind('EnterFrame', function () {
					
					// Move
					this.x += (enemy_shift_dir == "left")? -0.1 : 0.1;
				})
				.animate("waggle", 0, 0, 3)
				.animate("waggle", Crafty.math.randomInt(10, 80), -1);
			
			// Enemy type 2: Bomb-droppers
			} else if (type == "2") {
				Crafty.e("red_enemy, 2D, DOM, SpriteAnimation, Collision")
				.attr({ x: x, y: y, w: 32, h: 32})
				.bind('EnterFrame', function () {
					
					// Move
					this.x += (enemy_shift_dir == "left")? -0.1 : 0.1;
					
					// Drop bombs
					if (Crafty.math.randomInt(0, (200 / bomb_probability_modifiers[level])) == 1) {
						
						Crafty.e("2D, DOM, Color, Collision")
							.attr({ x: this.x + 16, y: this.y + 32, w: 6, h: 6})
							.color("red")
							.bind('EnterFrame', function () {
								this.y += 1 * level_speed_modifiers[level];
								if (this.y > 480) {
									this.destroy();
								}
								var ship_x = Crafty("ship").x, ship_y = Crafty("ship").y;
								if (this.x < ship_x) {
									this.x += bomb_curve_speed_modifiers[level];
								} else if (this.x > ship_x) {
									this.x -= bomb_curve_speed_modifiers[level];
								}
							})
							.addComponent('Gravity')
							.onHit('ship', function () {
								var x = this.x, y = this.y;
								create_explosion(this.x - 16, this.y);
								this.destroy();
								HP -= 10;
							});
					}
				})
				.animate("gnash", 0, 0, 3)
				.animate("gnash", Crafty.math.randomInt(10, 80), -1);
				
			// Enemy type 3: Swoopers
			} else if (type == "3") {
				Crafty.e("orange_enemy, 2D, DOM, SpriteAnimation, Collision")
				.attr({ x: x, y: y, w: 32, h: 32,
					swoopTargetX: 0, swoopTargetY: 0,
					swoopingDown: false, swoopingBackUp: false })
				.bind('EnterFrame', function () {
					
					// Move
					this.x += (enemy_shift_dir == "left")? -0.1 : 0.1;
					
					// Swoop
					if (this.swoopingDown) {
						if (this.x < this.swoopTargetX) {
							this.x += 1 * level_speed_modifiers[level];
						} else if (this.x > this.swoopTargetX) {
							this.x -= 1 * level_speed_modifiers[level];
						}
						this.y += 5 * level_speed_modifiers[level];
						
						if (this.y > 460) {
							this.swoopingDown = false;
							this.swoopingBackUp = true;
						}
					} else if (this.swoopingBackUp) {
						this.y -= 5 * level_speed_modifiers[level];
						if (this.y < 20) {
							this.swoopingBackUp = false;
							this.swoopTargetX = Crafty("ship").x;
							this.swoopTargetY = Crafty("ship").y;
							this.swoopingDown = true;
						}
					} else {
						if (Crafty.math.randomInt(0, 1000) == 1) {
							this.swoopTargetX = Crafty("ship").x;
							this.swoopTargetY = Crafty("ship").y;
							this.swoopingDown = true;
						}
					}
					
				})
				.animate("shift_uncomfortably", 0, 0, 7)
				.animate("shift_uncomfortably", Crafty.math.randomInt(10, 80), -1)
				.onHit('ship', function () {
					var x = this.x, y = this.y;
					this.destroy();
					HP -= 20;
					create_explosion(x, y);
				});
			}
		}
	}
}

function pad_text(string, width) { 
	return (width <= string.length) ? string : pad_text("0" + string, width);
}

// Enemy configurations per level
var enemy_configurations = [
	// Level 0
	[
		"0220220221",
		"1133333311",
		"3113333113",
		"3311331133",
		"0331111330",
		"0000000000"
	],
	// Level 1
	[
		"1000110001",
		"0101221010",
		"0211111120",
		"1111111111",
		"0111111110",
		"1101111011"
	],
	// Level 2
	[
		"1200000021",
		"1120000211",
		"0112002110",
		"0011221100",
		"0001111000",
		"0000110000"
	],
	// Level 3
	[
		"1210000121",
		"3121001213",
		"0312112130",
		"0031221300",
		"0001111000",
		"0000110000"
	],
	// Level 4
	[
		"3333333333",
		"2222222222",
		"1111111111",
		"0101010101",
		"1010101010",
		"0101010101"
	],
	// Level 5
	[
		"0202020202",
		"3030303030",
		"0202020202",
		"3030303030",
		"0202020202",
		"3030303030"
	],
	// Level 6
	[
		"0011111100",
		"0122222210",
		"0122222210",
		"0011111100",
		"0110110110",
		"1100110011",
	],
	// Level 7
	[
		"2300000032",
		"0230000320",
		"0023113200",
		"0023113200",
		"0230000320",
		"2300000032",
	],
	// Level 8
	[
		"2020330202",
		"2020330202",
		"2020330202",
		"2020330202",
		"2020330202",
		"2020330202",
	],
	// Level 9
	[
		"2323333232",
		"2323333232",
		"2323333232",
		"2323333232",
		"2323333232",
		"2323333232",
	],
	// Level 10
	[
		"2300000032",
		"0230000320",
		"0023333200",
		"0023333200",
		"0230000320",
		"2300000032",
	]
];

var level_speed_modifiers = {
	0: 1,
	1: 1.25,
	2: 1.5,
	3: 1.6,
	4: 1.7,
	5: 1.8,
	6: 2,
	7: 2.2,
	8: 2.4,
	9: 2.7,
	10: 3
};

var bomb_probability_modifiers = {
	0: 1,
	1: 1.1,
	2: 1.2,
	3: 1.3,
	4: 1.4,
	5: 1.5,
	6: 1.6,
	7: 1.7,
	8: 1.8,
	9: 1.9,
	10: 2
};

var bomb_curve_speed_modifiers = {
	0: 0,
	1: 0,
	2: 0,
	3: 0.25,
	4: 0.25,
	5: 0.25,
	6: 0.5,
	7: 0.5,
	8: 0.5,
	9: 0.75,
	10: 0.75
};


