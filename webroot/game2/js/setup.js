//generic setup data for everything

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

//blank statements for use by other files
function preload() {

}

function create() {
	game.state.add('menu',mainMenu);
	game.state.add('moon_landing',moonLanding);
	game.state.add('nine_eleven',nineEleven);
	game.state.add('rpi_game',rpi_game);

	game.state.start('rpi_game');
}

function update() {

}

function render() {

}

function createReturn() {
	var return_button = game.add.sprite(1150,600,'return_button');
	return_button.events.onInputDown.add(function() {
		game.state.start('menu');
	},this);
	return_button.anchor.setTo(0.5, 0.5);
}
