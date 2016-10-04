var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

var PLAYER_SPEED = 300;
var PLAYER_START_X = 100;
var PLAYER_START_Y = 410;

function preload() {
    game.load.image('9_11_background', 'assets/images/9_11_background_seamless.png');
    game.load.image('9_11_table', 'assets/images/9_11_table_seamless.png');
    game.load.spritesheet('player_crawling', 'assets/images/9_11_crawling_anim.png', 167,
        114);
    game.load.spritesheet('trash', 'assets/images/9_11_trash_spritesheet.png', 17,
        15);
}

// Object declarations
var backgrounds;
var tables;
var player;
var trash;
var cursors;

// Variable declarations
var fading = false;

function create() {
    game.world.setBounds(0, 0, 1334*3, 750);

	trash = game.add.group();
	trash.create(0,0,'trash');

    backgrounds = game.add.group();
    backgrounds.create(0,0,'9_11_background');
    backgrounds.create(1334,0,'9_11_background');
    backgrounds.create(1334*2,0,'9_11_background');
    backgrounds.create(1334*3,0,'9_11_background');
    backgrounds.create(1334*4,0,'9_11_background');

    tables = game.add.group();
    tables.create(0,200,'9_11_table');
    tables.create(1334,200,'9_11_table');
    tables.create(1334*2,200,'9_11_table');
    tables.create(1334*3,200,'9_11_table');
    tables.create(1334*4,200,'9_11_table');

    player = game.add.sprite (PLAYER_START_X,PLAYER_START_Y,'player_crawling');
    player.animations.add('player_crawling', [0], 6, true);
    player.anchor.setTo(0.5, 0.5);

    game.physics.arcade.enable(player);

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.onFadeComplete.add(resetFade, this);
}

function update() {
    // Set the interpolating camera to follow the player
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);

    /* START OF PLAYER MOVEMENT */
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (!fading) {
        if (cursors.left.isDown && player.body.x > 0) {
            player.body.velocity.x = -PLAYER_SPEED;
            player.animations.play('player_crawling');
            player.scale.x = -1;
        } else if (cursors.right.isDown && player.body.x) {
            player.body.velocity.x = PLAYER_SPEED;
            player.animations.play('player_crawling');
            player.scale.x = 1;
        }

        if (cursors.up.isDown && player.body.y > 253) {
            player.body.velocity.y = -PLAYER_SPEED;
            player.animations.play('player_crawling');
        } else if (cursors.down.isDown && player.body.y < 426) {
            player.body.velocity.y = PLAYER_SPEED;
            player.animations.play('player_crawling');
        }
    }
    /* END OF PLAYER MOVEMENT */

    /* START OF TIMER CODE */
    
    /* END OF TIMER CODE */
}

function render() {
    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);
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