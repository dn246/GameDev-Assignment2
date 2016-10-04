import "Phaser";

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

function preload() {
    game.load.image('tag', 'assets/filename.png');
    game.load.spritesheet('tag', 'assets/filename.png', width,
        height);
}

function create() {
// called once, when the game starts
}

function update() {
// called every frame
}
