// MiniGame for moonLanding conspiracy, basically DinerDash...

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

var PLAYER_SPEED = 300;
var PLAYER_START_X = 670;
var PLAYER_START_Y = 320;
var PLAYER_MAX_X = 1275;
var PLAYER_MAX_Y = 650;
var PLAYER_MIN_X = 65;
var PLAYER_MIN_Y = 130;

function preload() {
    game.load.image('moon_background', 'assets/images/moon_landing_background.png');
    game.load.image('moon_set', 'assets/images/moon_landing_set.png');
    game.load.spritesheet('player_walk', 'assets/images/mcwalkcycle.png', 118,
        211, 8);
    game.load.spritesheet('coffeeMug', 'assets/images/coffee_pot_sprite_sheet.png', 42,
        31, 6);
    game.load.spritesheet('cameraMan_walk', 'assets/images/cameraman_walk_cycle.png', 302,
        208, 4);
    game.load.spritesheet('director_walk', 'assets/images/director_walk_cycle.png', 310,
        226, 4);
    game.load.spritesheet('janitor_walk', 'assets/images/janitor_walk_cycle.png', 319,
        204, 4);
}

var player;
var coffeePot;
var cameraMan;
var director;
var janitor;
var moon_set;
var cursor;
var scoreText;
var timeText;
var timer;
var tween;

var fading = false;
var score = 0;
var time_left = 90;
var potCups = 5;



function create() {
    game.world.setBounds(0, 0, 1334, 750);

    // Add the group of moon_set to the game
    moon_set = game.add.group();
    moon_set.create(0,0,'moon_set');

    //player = game.add.group();
    // Set up player sprite and animation
    player = game.add.sprite (PLAYER_START_X,PLAYER_START_Y,'player_walk');
    player.animations.add('player_walking', [0,1,2,3,4,5,6,7], 6, true);
    player.animations.add('player_idle', [0], 6, true);
    player.anchor.setTo(0.5, 0.5);
    game.input.onDown.add(movePlayer, this);

    //a coffee mug stuck on the player
    coffeePot = game.add.sprite (45,-45,'coffeeMug');
    coffeePot.animations.add('filling', [5,4,3,2,1,0], 1, false);
    coffeePot.animations.add('full', [0], 6, true);
    coffeePot.animations.add('fourCup', [1], 6, true);
    coffeePot.animations.add('threeCup', [2], 6, true);
    coffeePot.animations.add('twoCup', [3], 6, true);
    coffeePot.animations.add('oneCup', [4], 6, true);
    coffeePot.animations.add('empty', [5], 6, true);
    player.addChild(coffeePot);

    //cameraman wants coffee...why doesn't he get it himself, he's on break...
    cameraMan = game.add.sprite (PLAYER_START_X+200,PLAYER_START_Y,'cameraMan_walk');
    cameraMan.animations.add('cameraMan_walking', [0,1,2,3], 6, true);
    cameraMan.animations.add('cameraMan_idle', [0], 6, true);

    //director wants coffee, better be quick
    director = game.add.sprite (PLAYER_START_X-200,PLAYER_START_Y,'director_walk');
    director.animations.add('director_walking', [0,1,2,3], 6, true);
    director.animations.add('director_idle', [0], 6, true);

    //janitor wants coffee, cool dude
    janitor = game.add.sprite (PLAYER_START_X,PLAYER_START_Y+200,'janitor_walk');
    janitor.animations.add('janitor_walking', [0,1,2,3], 6, true);
    janitor.animations.add('janitor_idle', [0], 6, true);

    // Set up text box for timer and score variable in UI
    var timeStyle = { font: "24px Arial", fill: "#000000", align: "left"};
    timeText = game.add.text(game.camera.x+25, game.camera.height-50, 'Time Rem: 90', timeStyle);
    var scoreStyle = { font: "24px Arial", fill: "#000000", align: "right"};
    scoreText = game.add.text(game.camera.x+game.camera.width-140, game.camera.height-50, 'Score: 0', scoreStyle);

    // Set up game physics, keyboard input, camera fade listener
    game.physics.arcade.enable(player);
    //cursor = game.input.mousePointer;
    cursor = game.input.pointer1;
    game.camera.onFadeComplete.add(resetFade, this);



    // Start the timer for the level
    game.time.events.add(Phaser.Timer.SECOND, secondTick, this);
}

function update() {


    updateUI();
}

function render() {

}

function movePlayer (pointer) {
    // Cancel any movement that is currently happening
    if (tween && tween.isRunning) {
        tween.stop();
    }

    // Flip the sprite and start the walking animation
    if (game.input.worldX >= player.body.x) {
        player.scale.x = 1;
    } else {
        player.scale.x = -1;
    }
    player.animations.play('player_walking', true);

    // Determine the time it will take to get to the pointer
    var duration = (game.physics.arcade.distanceToPointer(player, pointer) / PLAYER_SPEED) * 1000;
    // Start tween movement towards pointer
    //570-760x,170-220y is coffee table range
    //66-1250?,130-650y window size
    var tempX = game.input.worldX;
    var tempY = game.input.worldY;
    if (tempX < PLAYER_MIN_X){
        tempX = PLAYER_MIN_X;
    }
    else if(tempX > PLAYER_MAX_X){
        tempX = PLAYER_MAX_X;
    }
    if (tempY < PLAYER_MIN_Y){
        tempY = PLAYER_MIN_Y;
    }
    else if(tempY > PLAYER_MAX_Y){
        tempY = PLAYER_MAX_Y;
    }
    tween = game.add.tween(player).to({ x:tempX, y:tempY }, duration, Phaser.Easing.Linear.None, true);

    // Set a timer to stop the animation
    game.time.events.add(duration, function() {
        player.animations.stop('player_walking');
        player.animations.play('player_idle');}, this);
}

function updateUI() {
    // Update the text position as the camera moves
    timeText.x = game.camera.x+game.camera.width-170;
    timeText.y = game.camera.height-100;
    scoreText.x = game.camera.x+game.camera.width-170;
    scoreText.y = game.camera.height-50;
}

function refillPot(){
    if (potCups === 0) {
        coffeePot.animations.play('filling');
        potCups = 5;
    }else {
        console.log("not at 0 cups fuck off");
    }
}

function secondTick() {
    time_left -= 1;
    timeText.text = 'Time Rem: ' + time_left;
    if (time_left == 0) {
        GameOver();
    } else {
        game.time.events.add(Phaser.Timer.SECOND, secondTick, this);
    }
}

function randomEntry() {
    var randomizer = Math.floor(Math.random()*30);
    if (randomizer === 0){
        game.debug.text("left janitor");
    } else if (randomizer === 0){
        game.debug.text("right janitor");
    } else if (randomizer === 0){
        game.debug.text("left cameraman");
    } else if (randomizer === 0){
        game.debug.text("right cameraman");
    }
}

function GameOver() {
    // TODO: show highscore table and enter highscore
}

function resetLevel() {
    fade();
    fading = true;
}

function fade() {
    game.camera.fade(0x000000, 1000);
}

function resetFade() {
    game.camera.resetFX();
    player.body.x = PLAYER_START_X - 50;
    player.body.y = PLAYER_START_Y - 50;
    fading = false;
}

