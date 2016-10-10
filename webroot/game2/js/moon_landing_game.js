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
    game.load.image('moon_set', 'assets/images/moon_landing_set.png');
    game.load.spritesheet('player_walk', 'assets/images/mcwalkcycle.png', 118,
        211, 8);
    game.load.spritesheet('coffeeMug', 'assets/images/coffee_pot_sprite_sheet.png', 36,
        31, 6, 0, 8);
    game.load.spritesheet('cameraMan', 'assets/images/cameraman_walk_cycle.png', 129,
        208, 4 , 0 , 231);
    game.load.spritesheet('director', 'assets/images/director_walk_cycle.png', 128,
        226, 4, 0, 242);
    game.load.spritesheet('janitor', 'assets/images/janitor_walk_cycle.png', 159,
        204, 4, 0, 206);
    game.load.image('pot_refill', 'assets/images/coffee_speech_bubble.png');
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

    // Set up player sprite and animation
    player = game.add.sprite (PLAYER_START_X,PLAYER_START_Y,'player_walk');
    player.animations.add('player_walking', [0,1,2,3,4,5,6,7], 10, true);
    player.animations.add('player_idle', [0], 6, true);
    player.anchor.setTo(0.5, 0.5);
    game.input.onDown.add(movePlayer, this);

    //a coffee mug stuck on the player
    coffeePot = game.add.sprite (45,-45,'coffeeMug');
    coffeePot.animations.add('filling', [5,4,3,2,1,0], 2, true);
    coffeePot.animations.add('full', [0], 6, true);
    coffeePot.animations.add('fourCup', [1], 6, true);
    coffeePot.animations.add('threeCup', [2], 6, true);
    coffeePot.animations.add('twoCup', [3], 6, true);
    coffeePot.animations.add('oneCup', [4], 6, true);
    coffeePot.animations.add('empty', [5], 6, true);
    player.addChild(coffeePot);

    //cameraman wants coffee...why doesn't he get it himself, he's on break...
    createCustomer('cameraMan');

    //director wants coffee, better be quick
    createCustomer('director');

    //janitor wants coffee, cool dude
    createCustomer('janitor');

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

function createCustomer(filename){
    var x = Math.floor(Math.random()*200)+100, t_scale = 1, y = 130, side = -100;
    if (Math.random() < 0.5){
        x += 900;
        side = 1444;
        t_scale = -1;
    }
    y += Math.floor(Math.random()*520);
    console.log(x);

    var customer = game.add.sprite(side, y, filename);
    customer.animations.add(filename+'_walking',[0,1,2,3], 6, true);
    customer.animations.add(filename+'_idle',[1], 6, true);
    customer.animations.play(filename+'_walking');
    customer.anchor.setTo(.5,.5);

    //add the bubble demanding coffee and set it up to be a child of the customer
    var speech_bubble = game.add.sprite(0, -175, "pot_refill");
    customer.addChild(speech_bubble);
    customer.scale.x = t_scale;

    var duration = (game.physics.arcade.distanceToXY(customer, x, y) / PLAYER_SPEED) * 1000;
    game.add.tween(customer).to({ x:x, y:y }, duration, Phaser.Easing.Linear.None, true);
    game.time.events.add(duration, function() {
        customer.animations.stop(filename+'_walking');
        customer.animations.play(filename+'_idle');}, this);
}

function update() {

    if (player.x > 570 && player.x < 760 && player.y < 220){
        refillPot();
    }

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

