//menu for the overall conspiracy theory game

var mainMenu = {
    preload: function () {
        game.load.spritesheet('turning_page', 'assets/images/notebook_flip.png', 1152, 754);
        game.load.image('return_button', 'assets/images/button_return_notebook.png');
        game.load.image('moon_landing','assets/images/menu_moon_landing_b.png')
    },
    create: function () {
        var notebook = mainMenu.add.sprite(80, 0, 'turning_page');
        notebook.animations.add('turning_page', [0, 1, 2, 3], 6, true);

        //turning_page.animations.play('turning_page');
        mainMenu.add.text(800, 175, 'The moon landing was Staged!', bookTitleStyle);
        mainMenu.clickMiniGame(950, 400, 'moon_landing', 'moon');

        /*var selectStyle = {font: "16px Arial", fill: "#000000", align: "left"};
        var select_9_11 = mainMenu.add.text(750, 325, 'Bush did 9/11', selectStyle);
        var select_moon_landing = mainMenu.add.text(750, 375, 'The Moon Landing was staged', selectStyle);
        var select_weather_machine = mainMenu.add.text(750, 425, 'RPI Weather Machine', selectStyle);*/

    },

    clickMiniGame: function (x,y, pic, state) {
        var miniGameBtn = mainMenu.add.sprite(x, y, pic);
        miniGameBtn.inputEnabled = true;
        miniGameBtn.events.onInputDown.add(function() {
            game.state.start(state);
        });
        miniGameBtn.anchor.setTo(0.5, 0.5);
    }
}