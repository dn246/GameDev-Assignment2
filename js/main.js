import "Phaser";

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

function preload() {
    game.load.image('9_11_background', 'assets/images/9_11_background_seamless.png');
    /*
    game.load.image('9_11_table', 'assets/images/9_11_table_seamless.png');
    game.load.spritesheet('player_crawling', 'assets/images/9_11_crawling_anim.png', 167,
        114);
    game.load.spritesheet('trash', 'assets/images/9_11_trash_spritesheet.png', 17,
        15);
	*/
}

var backgrounds;
var player;
var trash;

function create() {
	//backgrounds = game.add.group();
	//backgrounds.create(0,0,'9_11_background');

	var background = game.add.sprite (0,0,'9_11_background');
	//backgrounds.add(background);
}

function update() {
	// called every frame
}
