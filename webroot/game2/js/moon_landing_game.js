// MiniGame for moonLanding conspiracy, basically DinerDash...

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

var PLAYER_SPEED = 300;
var PLAYER_START_X = 200;
var PLAYER_START_Y = 400;

//nope
var TRASH_X_MIN = 300;
var TRASH_X_RANGE = 1000;
var TRASH_Y_MIN = 320;
var TRASH_Y_RANGE = 200;

function preload() {
    game.load.image('moon_background', 'assets/images/moon_landing_background.png');
    game.load.image('moon_set', 'assets/images/moon_landing_set.png');
    //nope
    game.load.image('trash', 'assets/images/9_11_trash.png');
    game.load.spritesheet('player_walking', 'assets/images/cameraman_walk_cycle.png', 100,
        100,4);
}

// Object declarations
var backgrounds;
var moon_set;
var player;
var trash;
var cursors;
var scoreText;
var timeText;
var timer;

// Variable declarations
var fading = false;
var score = 0;
var time_left = 90;
var seamless_total = 1;

function create() {
    game.world.setBounds(0, 0, 1334*(seamless_total+1), 750);

    // Add the group of moon_set to the game
    moon_set = game.add.group();
    moon_set.create(0,0,'moon_set');

    // Set up player sprite and animation
    player = game.add.sprite (PLAYER_START_X,PLAYER_START_Y,'player_walking');
    player.animations.add('player_walking', [1,2,3,4], 6, true);
    player.anchor.setTo(0.5, 0.5);

    // Add the group of trash bits to the game
    trash = game.add.group();
    generateTrash();

    // Set up text box for timer and score variable in UI
    var timeStyle = { font: "24px Arial", fill: "#000000", align: "left"};
    timeText = game.add.text(game.camera.x+25, game.camera.y+25, 'Time Rem: 90', timeStyle);
    var scoreStyle = { font: "24px Arial", fill: "#000000", align: "right"};
    scoreText = game.add.text(game.camera.x+game.camera.width-140, game.camera.y+25, 'Score: 0', scoreStyle);

    // Set up game physics, keyboard input, camera fade listener
    game.physics.arcade.enable(player);
    cursors = game.input.keyboard.createCursorKeys();
    game.camera.onFadeComplete.add(resetFade, this);

    // Start the timer for the level
    game.time.events.add(Phaser.Timer.SECOND, secondTick, this);
}

function update() {
    // Set the interpolating camera to follow the player
    //game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);
    // Add collision to trash objects so they can be picked up
    game.physics.arcade.enable(trash);
    game.physics.arcade.overlap(player, trash, collectTrash, null, this);

    updateUI();
    playerMovement();
    checkEndlessGeneration();
}

function render() {
    //game.debug.text( seamless_total.toString(), 100, 380 );
}

function playerMovement() {
    // Check input for arrow keys to move player with animation
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (!fading) {
        if (cursors.left.isDown && player.body.x > 0) {
            player.body.velocity.x = -PLAYER_SPEED;
            player.animations.play('player_walking');
            player.scale.x = -1;
        } else if (cursors.right.isDown && player.body.x) {
            player.body.velocity.x = PLAYER_SPEED;
            player.animations.play('player_walking');
            player.scale.x = 1;
        }

        if (cursors.up.isDown && player.body.y > 200) {
            player.body.velocity.y = -PLAYER_SPEED;
            player.animations.play('player_walking');
        } else if (cursors.down.isDown && player.body.y < 650) {
            player.body.velocity.y = PLAYER_SPEED;
            player.animations.play('player_walking');
        }
    }
}

function checkEndlessGeneration() {
    if (player.body.x > seamless_total * 1334) {
        seamless_total++;
        backgrounds.create(1334*seamless_total,0,'9_11_background');
        moon_set.create(1334*seamless_total,200,'9_11_table');
        game.world.setBounds(0, 0, 1334*(seamless_total+1), 750);
        generateTrash();
    }
}

function generateTrash() {
    for (i = 0; i < Math.floor((Math.random() * 5) + 5); i++) {
        trash.create((seamless_total-1)*1334+Math.floor((Math.random() * TRASH_X_RANGE) + TRASH_X_MIN), Math.floor((Math.random() * TRASH_Y_RANGE) + TRASH_Y_MIN),'trash');
    }
}

function updateUI() {
    // Update the text position as the camera moves
    timeText.x = game.camera.x+25;
    timeText.y = game.camera.y+25;
    scoreText.x = game.camera.x+game.camera.width-140;
    scoreText.y = game.camera.y+25;
}

function collectTrash(player, t) {
    // Remove the trash from the screen
    t.kill();
    // Update score and scoreText
    score += 10;
    scoreText.text = 'Score: ' + score;
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
    if (randomizer == 0){
        game.debug.text("left janitor");
    } else if (randomizer == 0){
        game.debug.text("right janitor");
    } else if (randomizer == 0){
        game.debug.text("left cameraman");
    } else if (randomizer == 0){
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

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}