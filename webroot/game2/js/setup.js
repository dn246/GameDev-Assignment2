//generic setup data for everything

var game = new Phaser.Game(1334, 750, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

//MAIN MENU VARIABLES
var bookTitleStyle = { font: "32px Arial", fill: "#000000", align: "center",
    wordWrap: true, wordWrapWidth: 475};
var bookTextStyle = { font: "20px Arial", fill: "#000000", align: "left",
    wordWrap: true, wordWrapWidth: 475};
var currentPage = 0;

//CUT SCENE VARIABLES
var cutSceneStyle = { font: "20px Arial", fill: "#000000", align: "left",
    wordWrap: true, wordWrapWidth: 400, backgroundColor: "#c4b98a"};

//ALL GAME VARIABLES
var player;
var interacting = false;
var cursors;
var scoreText;
var timeText;
var tween;
var allGroup;
var fading = false;
var backgrounds;
var score = 0;
var duration = 0;
var time_left = 30;
var PLAYER_SPEED = 300;
var PLAYER_START_X = 100;
var PLAYER_START_Y = 410;
var MINIMUM_SWIPE = 200;
var game_over = false;


//MOON LANDING GAME VARIABLES
var coffeePot;
var moon_set;
var customerGroup;

// 9 / 11 GAME VARIABLES
var TRASH_X_MIN = 100;
var TRASH_X_RANGE = 1200;
var TRASH_Y_MIN = 410;
var TRASH_Y_RANGE = 200;
var CLEAN_TIME = 400;
var tables;
var trash;
var foregrounds;
var tv;
var remote;
var seamless_total = 1;
var cleaning = false;
var clean_click = false;

// RAIN DANCE GAME VARIABLES
var MOVE_DURATION = 1000;
var LEFT_ANIM = 0;
var DOWN_ANIM = 1;
var RIGHT_ANIM = 2;
var UP_ANIM = 3;
var shirley;
var emitter;
var can_swipe = true;
var level = -1;
var curr_i = 0;
var player_turn = false;
var dance_moves = [[0],[1,2],[3,2,1],[0,1,2,3]];
var your_moves = [];
/*
 dance_moves = ...
              index = 0    index = 1    index = 2
 +-------------------------------------------------+
 |level = 0 |danceMove(n)|            |            |
 |level = 1 |danceMove(n)|danceMove(n)|            |
 |level = 2 |danceMove(n)|danceMove(n)|danceMove(n)|
 +-------------------------------------------------+
 */

// Sound declarations
var fx_boo;
var fx_cheer;
var fx_chirp;
var fx_cleaning;
var fx_click;
var fx_clock_buzzer;
var fx_cofee_pour;
var fx_ding;
var fx_incorrect;
var fx_main_music;
var fx_moon_guote;
var fx_page_turn;
var fx_short_pour;
var fx_thunder_storm;
var fx_tv_click;



game.state.add('menu',mainMenu);
game.state.add('intro',cutScenes);
game.state.add('9/11',nineEleven);
game.state.add('moon',moonLanding);
game.state.add('rain',rain_dance);

game.state.start('intro');

//blank statements for use by other files
function preload() {

}
function create() {

}
function update() {

}
function render() {

}

//used by each game to return to main menu upon completion
function createReturn() {
	var return_button = game.add.sprite(1150,600,'return_button');
    return_button.inputEnabled = true;
	return_button.events.onInputDown.add(function() {
		game.state.start('menu');
	});
	return_button.anchor.setTo(0.5, 0.5);
}
