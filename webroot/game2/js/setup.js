//generic setup data for everything

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

//blank statements for use by other files
function preload() {

}

function create() {
	game.state.add('menu',mainMenu);
	game.state.add('moon_landing',moonLanding);
	//game.state.add('nine_eleven',nineEleven);
	//game.state.add('rpi_game',rpi_game);

	game.state.start('moon_landing');
}

function update() {

}

function render() {

}