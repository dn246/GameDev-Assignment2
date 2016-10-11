//generic setup data for everything

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

game.state.add('menu',mainMenu);
game.state.add('moon_landing',moonLanding);

game.state.start('moon_landing');

//blank statements for use by other files
function preload() {

}
function create() {

}
function update() {

}
function render() {

}