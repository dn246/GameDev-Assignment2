var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

var MOVE_DURATION = 1500;
var LEFT_ANIM = 0;
var DOWN_ANIM = 1;
var RIGHT_ANIM = 2;
var UP_ANIM = 3;

function preload() {
    game.load.image('rpi_background', 'assets/images/rain_dance_background_01.png');
    game.load.image('swipe_arrow', 'assets/images/rain_dance_arrow_swipe.png');
    game.load.spritesheet('player_dancing', 'assets/images/rain_dance_player_sprite.png', 120, 156);
    game.load.spritesheet('shirley_dancing', 'assets/images/rain_dance_the_honorable_sprite.png', 156, 180);
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
var curr_i = 0;
var time_left = 10;
var player_turn = false;
var dance_moves = [[0],[0,1],[0,1,2],[0,1,2,3]];
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
    player = game.add.sprite (445,600,'player_dancing');
    player.animations.add('dancing_left',  [6], 1, true);
    player.animations.add('dancing_down',  [3], 1, true);
    player.animations.add('dancing_right', [5], 1, true);
    player.animations.add('dancing_up',    [4], 1, true);
    player.anchor.setTo(0.5, 0.5);

    // Set up shirley's sprite and animation
    shirley = game.add.sprite (890,600,'shirley_dancing');
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
    curr_i = 0;
    time_left = 10;

    // Start the timer for the player
    game.time.events.add(1000, secondTick, this);
}

function secondTick() {
    time_left -= 1;
    if (time_left < 0) {
        time_left = 0;
    }
    timeText.text = 'Time Left: ' + time_left;
    if (time_left == 0) {
        updateScore(10);
        console.log("PLAYER FAIL");
        shirleysTurn();
    } else {
        game.time.events.add(1000, secondTick, this);
    }
}

function shirleysTurn() {
    if (!game_over) {
        if (level + 1 == dance_moves.length) {
            GameOver();
            return;
        }
        player_turn = false;
        timeText.visible = false;
        curr_i = 0;
        your_moves = [];
        level++;

        console.log("SHIRLEYS TURN [" + your_moves + "] != [" + dance_moves[level] + "]");

        // set a timer for the total duration of all the dance moves together to change turns
        var shirleysTurn_length = MOVE_DURATION * dance_moves[level].length;
        console.log('players turn in ' + shirleysTurn_length); 
        game.time.events.add(shirleysTurn_length, function() {
            playersTurn();
        }, this);
        
        ShirleyDanceMove();
    }
}

function checkMoves() {
    if (player_turn) {
        // Check the list of moves so far you've done this turn against shirley's moves
        var same_elements = your_moves.every(function(element, index) {
            return element === dance_moves[level][index];
        });

        if (same_elements) {
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
    }
}

function ShirleyDanceMove() {
    game.time.events.add(MOVE_DURATION * curr_i, function() {
        danceMove(shirley, dance_moves[level][curr_i]);
        console.log("SHIRLEY DANCE ANIM START " + dance_moves[level][curr_i]);
        curr_i++;
        if (curr_i < dance_moves[level].length) {
            ShirleyDanceMove();
        }
    }, this);
}

function danceMove(character, i) {
    if (character == player) {
        game.time.events.add(MOVE_DURATION, checkMoves, this);
    } else {
        swipeArrow(i);
    }

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

function swipeArrow(dir) {
    var moveX = 667, moveY = 375;
    var arrow = game.add.sprite(moveX,moveY,'swipe_arrow');
    arrow.anchor.setTo(0.5,0.5);
    arrow.scale.x = 0;
    arrow.scale.y = 0;
    if (dir == RIGHT_ANIM) {
        arrow.angle = 0;
        moveX = 1334-400;
        arrow.x -= 200;
    } else if (dir == UP_ANIM) {
        arrow.angle = 270;
        moveY = 0;
    } else if (dir == LEFT_ANIM) {
        arrow.angle = 180;
        moveX = 400;
        arrow.x += 200;
    } else if (dir == DOWN_ANIM) {
        arrow.angle = 90;
        moveY = 750;
    }
    game.add.tween(arrow).to({ x: moveX, y: moveY}, MOVE_DURATION, "Sine.easeInOut", true);
    game.add.tween(arrow.scale).to({ x: 1+curr_i/10, y: 1+curr_i/10 }, MOVE_DURATION, Phaser.Easing.Linear.None, true);
    game.add.tween(arrow).to({ alpha : 0 }, MOVE_DURATION, "Sine.easeInOut", true);
    game.time.events.add(MOVE_DURATION, function() {
        arrow.kill();
    }, this);
}

function GameOver() {
    console.log('GameOver');
    game_over = true;
    player_turn = false;
}

function updateScore(s) {
    score += s;
    emitter.frequency = (101 - score) * 10;
    scoreText.text = 'Precipitation: ' + score + '%';
}