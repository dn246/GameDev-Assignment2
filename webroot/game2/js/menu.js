var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',{ preload: preload, create: create, update: update });

function preload() {
	game.load.spritesheet('turning_page', 'assets/images/notebook_flip.png', 1152, 754);
}

var notebook;
var select_9_11;
var moon_land_select;
var weather_machine_select;

function create() {
	notebook = game.add.sprite(80,0,'turning_page');
    notebook.animations.add('turning_page', [0,1,2,3], 6, true);

    //turning_page.animations.play('turning_page');

    var selectStyle = {font: "16px Arial", fill: "#000000", align: "left"};
    select_9_11 = game.add.text(750, 325, 'Bush did 9/11', selectStyle);
    moon_land_select = game.add.text(750, 375, 'Moon Landing was staged', selectStyle);
    weather_machine_select = game.add.text(750, 425, 'RPI Weather Machine', selectStyle);

    select_9_11.events.onInputDown.add(function() {
    		window.open('./9_11_game.html');
    	}, this);
    select_9_11.events.onInputOver.add(function() {
    		select_9_11.set({fontSize: "20px Arial"});
    	}, this);
}

function update() {
	
}