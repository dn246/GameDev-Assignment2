var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

var PLAYER_SPEED = 300;
var PLAYER_START_X = 100;
var PLAYER_START_Y = 410;
var TRASH_X_MIN = 100;
var TRASH_X_RANGE = 1200;
var TRASH_Y_MIN = 410;
var TRASH_Y_RANGE = 200;
var CLEAN_TIME = 400;

function preload() {
    game.load.image('9_11_background', 'assets/images/9_11_background_dark.png');
    game.load.image('9_11_table', 'assets/images/9_11_seamless_table.png');
    game.load.image('9_11_foreground', 'assets/images/9_11_seamless_foreground.png');
    game.load.spritesheet('player_crawling', 'assets/images/9_11_player_sprite_2.png', 145, 106);
    game.load.spritesheet('trash', 'assets/images/9_11_trash_sprites.png', 92, 60);
    game.load.spritesheet('bubbles', 'assets/images/9_11_bubbles_small.png', 43, 30);
}

// Object declarations
var backgrounds;
var tables;
var player;
var trash;
var foregrounds;
var cursors;
var scoreText;
var timeText;
var timer;
var allGroup;

// Variable declarations
var fading = false;
var score = 0;
var time_left = 30;
var seamless_total = 1;
var tween;
var duration = 0;
var cleaning = false;
var clean_click = false;

function create() {
    game.world.setBounds(0, 0, 1334*(seamless_total+1), 750);

    // Add the group of backgrounds to the game
    backgrounds = game.add.group();
    backgrounds.create(0,0,'9_11_background');
    backgrounds.create(1334,0,'9_11_background');

    // Add the group of tables to the game
    tables = game.add.group();
    tables.create(0,0,'9_11_table');
    tables.create(1334,0,'9_11_table');

    // Set up player sprite and animation
    player = game.add.sprite (PLAYER_START_X,PLAYER_START_Y,'player_crawling');
    player.animations.add('player_crawling', [0,1,2], 5, true);
    player.animations.add('player_cleaning', [3,4,5], 10, true);
    player.anchor.setTo(0.5, 0.5);
    game.input.onDown.add(movePlayer, this);

    // Add the group of trash bits to the game
    trash = game.add.group();
    generateTrash();

    // Add the group of backgrounds to the game
    foregrounds = game.add.group();
    foregrounds.create(0,0,'9_11_foreground');
    foregrounds.create(1334,0,'9_11_foreground');

    // Set up text box for timer and score variable in UI
    var timeStyle = { font: "24px Arial", fill: "#ffffff", align: "left"};
    timeText = game.add.text(game.camera.x+25, game.camera.y+25, 'Time Left Until Exposure: 30', timeStyle);
    var scoreStyle = { font: "24px Arial", fill: "#ffffff", align: "right"};
    scoreText = game.add.text(game.camera.x+game.camera.width-300, game.camera.y+25, 'Government filth cleaned up: 0', scoreStyle);

    // Set up game physics, keyboard input, camera fade listener
    game.physics.arcade.enable(player);
    cursors = game.input.keyboard.createCursorKeys();
    game.camera.onFadeComplete.add(resetFade, this);

    // Start the timer for the level
    game.time.events.add(Phaser.Timer.SECOND, secondTick, this);

    // Add all objects to the allGroup
    allGroup = game.add.group();
    allGroup.add(backgrounds);
    allGroup.add(tables);
    allGroup.add(player);
    allGroup.add(trash);
    allGroup.add(foregrounds);
    allGroup.add(timeText);
    allGroup.add(scoreText);
}

function update() {
    // Set the interpolating camera to follow the player
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);
    // Add collision to trash objects so they can be picked up
    game.physics.arcade.enable(trash);

    updateUI();
    checkEndlessGeneration();

    trash.forEach(function(t) {
            if (t.scale.x <= 0) {
                score += 1;
                scoreText.text = 'Government filth cleaned up: ' + score;
                trash.remove(t);
                t.kill();
            }
        });

    allGroup.sort('y', Phaser.Group.SORT_ASCENDING);
}

function movePlayer (pointer) {
    if (!cleaning && game.input.worldY > TRASH_Y_MIN && game.input.worldY < TRASH_Y_MIN+TRASH_Y_RANGE) {
        // Cancel any movement that is currently happening
        if (tween && tween.isRunning) {
            tween.stop();
        }

        var moveX;
        // Flip the sprite and start the walking animation
        if (game.input.worldX < player.body.x) {
            player.scale.x = 1;
            moveX = game.input.worldX + 72;
        } else {
            player.scale.x = -1;
            moveX = game.input.worldX - 72;
        }
        player.animations.play('player_crawling', true);

        // Determine the time it will take to get to the pointer
        duration = (game.physics.arcade.distanceToPointer(player, pointer) / PLAYER_SPEED) * 1000;
        // Start tween movement towars pointer
        tween = game.add.tween(player).to({ x: moveX, y: game.input.worldY - 50}, duration, "Sine.easeInOut", true);

        // Set timers to start/stop the cleaning animation once at trash location
        if (clean_click) {
            game.time.events.add(duration, function() {
                    player.animations.play('player_cleaning', false);
                    cleaning = true;
                }, this);
            game.time.events.add(duration+CLEAN_TIME, function() {
                    player.animations.stop('player_cleaning');
                    cleaning = false;
                }, this);
        } else {
            game.time.events.add(duration, function() {
                    player.animations.stop('player_crawling');
                    cleaning = false;
                }, this);
        }
    }
}

function tapTrash(t) {
    if (!cleaning) {
        var i = 0;
        while (i < 3) {
            createBubbles(t.body.x+20+i*25,t.body.y+15+(Math.random()*25-12));
            i++;
        }

        // Shrink the piece of trash
        game.add.tween(t.scale).to({ x: 0, y: 0}, CLEAN_TIME, "Sine.easeInOut", true, duration);
    }
}

function checkEndlessGeneration() {
    if (player.body.x > seamless_total * 1334) {
        seamless_total++;
        backgrounds.create(1334*seamless_total,0,'9_11_background');
        tables.create(1334*seamless_total,0,'9_11_table');
        foregrounds.create(1334*seamless_total,0,'9_11_foreground');
        game.world.setBounds(0, 0, 1334*(seamless_total+1), 750);
        generateTrash();

        allGroup.add(backgrounds);
        allGroup.add(tables);
        allGroup.add(trash);
        allGroup.add(foregrounds);
    }
}

function createBubbles(x, y) {
    // Create bubbles particle effect
    var bubbles;
    game.time.events.add(duration, function() {
            bubbles = game.add.sprite(x, y,'bubbles');
            bubbles.animations.add('bubbles', [0,1], 5, true);
            bubbles.anchor.setTo(0.5, 0.5);
            // Tween the bubbles scale and alpha
            game.add.tween(bubbles.scale).to({ x: 1.5, y: 1.5}, CLEAN_TIME, "Sine.easeInOut", true);
            game.add.tween(bubbles).to({ alpha : 0 }, CLEAN_TIME, "Sine.easeInOut", true);
            // Set a timer to destroy the bubbles after they dissapear
            game.time.events.add(duration+CLEAN_TIME, function() {bubbles.kill}, this);
        }, this);
}

function generateTrash() {
    var sub = 0, num = Math.floor(Math.random() * 5 + 5);
    for (i = 0; i < num; i++) {
        sub = Math.floor(Math.random() * 8);
        var t = trash.create((seamless_total-1)*1334+Math.floor((Math.random() * TRASH_X_RANGE) + TRASH_X_MIN), Math.floor((Math.random() * TRASH_Y_RANGE) + TRASH_Y_MIN),'trash',sub);
    }
    trash.setAll('inputEnabled', true);
    trash.setAll('input.useHandCursor', true);
    trash.forEach(function(t) {
            t.events.onInputDown.add(tapTrash,this); 
            t.anchor.setTo(0.5, 0.5);
            t.events.onInputOver.add(function() {clean_click = true;}, this);
            t.events.onInputOut.add(function() {clean_click = false;}, this);
        });
}

function updateUI() {
    // Update the text position as the camera moves
    timeText.x = game.camera.x+25;
    timeText.y = game.camera.y+25;
    scoreText.x = game.camera.x+game.camera.width-365;
    scoreText.y = game.camera.y+25;
}

function secondTick() {
    time_left -= 1;
    timeText.text = 'Time Left Until Exposure: ' + time_left;
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
    player.body.x = PLAYER_START_X - 83.5;
    player.body.y = PLAYER_START_Y - 57;
    fading = false;
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}