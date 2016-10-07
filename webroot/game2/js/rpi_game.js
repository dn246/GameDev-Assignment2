var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

var MOVE_DURATION = 1000;
var LEFT_ANIM = 0;
var DOWN_ANIM = 1;
var RIGHT_ANIM = 2;
var UP_ANIM = 3;

function preload() {
    game.load.image('rpi_background', 'assets/images/9_11_background.png');
    game.load.spritesheet('player_dancing', 'assets/images/rain_dance_player_sprite.png', 120, 160);
    game.load.spritesheet('shirley_dancing', 'assets/images/rain_dance_the_honorable_sprite.png', 156, 204);
    game.load.spritesheet('rain', 'assets/images/snowflakes.png', 17, 17);
}

// Object declarations
var background;
var player;
var shirley;
var cursors;
var scoreText;
var timeText;
var emitter;

// Variable declarations
var score = 50;
var can_swipe = true;
var tween;
var duration = 0;
var level = -1;
var index = 0;
var time_left = 10;
var player_turn = false;
var dance_moves = [[0],[0,1],[0,1,2]];
var your_moves = [];
var game_over = false;
/*
dance_moves = ...
             index = 0    index = 1    index = 2
          +--------------------------------------+
level = 0 |danceMove(n)|            |            |
level = 1 |danceMove(n)|danceMove(n)|            |
level = 2 |danceMove(n)|danceMove(n)|danceMove(n)|
          +--------------------------------------+
*/

function create() {
    // Add the group of backgrounds to the game
    background = game.add.sprite(0,0,'rpi_background');

    // Set up player sprite and animation
    player = game.add.sprite (445,375,'player_dancing');
    player.animations.add('dancing_left',  [0], 1, true);
    player.animations.add('dancing_down',  [1], 1, true);
    player.animations.add('dancing_right', [2], 1, true);
    player.animations.add('dancing_up',    [2], 1, true);
    player.anchor.setTo(0.5, 0.5);

    // Set up shirley's sprite and animation
    shirley = game.add.sprite (890,375,'shirley_dancing');
    shirley.animations.add('dancing_left',  [6], 1, true);
    shirley.animations.add('dancing_down',  [3], 1, true);
    shirley.animations.add('dancing_right', [5], 1, true);
    shirley.animations.add('dancing_up',    [4], 1, true);
    shirley.anchor.setTo(0.5, 0.5);

    emitter = game.add.emitter(game.world.centerX, -200, 400);
    emitter.width = game.world.width;
    //emitter.angle = 30; // uncomment to set an angle for the rain.

    emitter.makeParticles('rain');

    emitter.minParticleScale = 0.25;
    emitter.maxParticleScale = 1;

    emitter.setYSpeed(300, 500);
    emitter.setXSpeed(-5, 5);

    emitter.start(false, 1600, 5, 0);
    emitter.frequency = 500;

    // Set up text box for the score variable in UI
    var scoreStyle = { font: "24px Arial", fill: "#ffffff", align: "left"};
    scoreText = game.add.text(25, 25, 'Precipitation: 50%', scoreStyle);
    var timeStyle = { font: "24px Arial", fill: "#ffffff", align: "left"};
    timeText = game.add.text(1170, 25, 'Time Left: 10', timeStyle);
    timeText.visible = false;

    // Set up touch input
    cursors = game.input.pointer1;

    // Start Shirley's first turn
    shirleysTurn();
}

function update() {
    checkSwipes();
}

function playersTurn() {
    console.log("PLAYERS TURN");
    player_turn = true;
    timeText.visible = true;

    // Start the timer for the player
    game.time.events.add(1000, secondTick, this);
}

function shirleysTurn() {
    if (level + 1 == dance_moves.length) {
        GameOver();
    }

    if (!game_over) {
        player_turn = false;
        your_moves = [];
        time_left = 10;
        timeText.visible = false;
        level++;

        console.log("SHIRLEYS TURN [" + your_moves + "] != [" + dance_moves[level] + "]");

        var i = 0;
        // for each dance move in this level, start a timer to play the dance animation
        dance_moves[level].forEach(function() {
            game.time.events.add(MOVE_DURATION * i, function() {
                danceMove(shirley, dance_moves[level][i]);
                console.log("SHIRLEY DANCE ANIM START " + dance_moves[level][i]);
                i++;
            }, this);
        });

        // set a timer for the total duration of all the dance moves together to change turns
        game.time.events.add(MOVE_DURATION * (dance_moves[level].length), function() {
            playersTurn();
        }, this);
    }
}

function checkSwipes() {
    if (player_turn && !game_over) {
        if (can_swipe) {
            var swipeCoordX,
                swipeCoordY,
                swipeCoordX2,
                swipeCoordY2,
                swipeMinDistance = 100;
            game.input.onDown.add(function(pointer) {
                swipeCoordX = pointer.clientX;
                swipeCoordY = pointer.clientY;
                }, this);
            game.input.onUp.add(function(pointer) {
                if (can_swipe) {
                    swipeCoordX2 = pointer.clientX;
                    swipeCoordY2 = pointer.clientY;
                    console.log("P1(" + swipeCoordX + "," + swipeCoordY + ")");
                    console.log("P2(" + swipeCoordX2 + "," + swipeCoordY2 + ")");
                    if(swipeCoordX2 < swipeCoordX - swipeMinDistance){
                        your_moves.push(LEFT_ANIM);
                        danceMove(player, LEFT_ANIM);
                        console.log("left pushed " + LEFT_ANIM);
                    } else if(swipeCoordX2 > swipeCoordX + swipeMinDistance) {
                        your_moves.push(RIGHT_ANIM);
                        danceMove(player, RIGHT_ANIM);
                        console.log("right pushed " + RIGHT_ANIM);
                    } else if(swipeCoordY2 < swipeCoordY - swipeMinDistance) {
                        your_moves.push(UP_ANIM);
                        danceMove(player, UP_ANIM);
                        console.log("up pushed " + UP_ANIM);
                    } else if(swipeCoordY2 > swipeCoordY + swipeMinDistance) {
                        your_moves.push(DOWN_ANIM);
                        danceMove(player, DOWN_ANIM);
                        console.log("right pushed " + DOWN_ANIM);
                    }
                }
                can_swipe = false;
                game.time.events.add(MOVE_DURATION, function() {can_swipe = true;}, this);
            }, this);
        }

        // Check the list of moves so far you've done this turn against shirley's moves
        var same_elements = your_moves.every(function(element, index) {
            return element === dance_moves[level][index];
        });

        if (same_elements) {
            //console.log("your_moves.length = " + your_moves.length);
            //console.log("dance_moves[level].length = " + dance_moves[level].length);
            if (your_moves.length > 0 && your_moves.length == dance_moves[level].length) {
                game.time.events.add(MOVE_DURATION, function() {
                    updateScore(-10);
                    console.log("PLAYER SUCCESS [" + your_moves + "] == [" + dance_moves[level] + "]");
                    shirleysTurn();
                }, this);
            }
        } else {
            updateScore(10);
            console.log("PLAYER FAIL");
            shirleysTurn();
        }
    }
}

function secondTick() {
    time_left -= 1;
    timeText.text = 'Time Left: ' + time_left;
    if (time_left == 0) {
        shirleysTurn();
    } else {
        game.time.events.add(1000, secondTick, this);
    }
}

function danceMove(character, i) {
    if (i == 0) {
        character.animations.play('dancing_left');
    } else if (i == 1) {
        character.animations.play('dancing_down');
    } else if (i == 2) {
        character.animations.play('dancing_right');
    } else if (i == 3) {
        character.animations.play('dancing_up');
    }
}

function GameOver() {
    console.log('GameOver');
    game_over = true;
}

function updateScore(s) {
    score += s;
    emitter.frequency = (101 - score) * 10;
    scoreText.text = 'Precipitation: ' + score + '%';
}