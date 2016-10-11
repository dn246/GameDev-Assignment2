//menu for the overall conspiracy theory game

var mainMenu = {
    preload: function () {
        game.load.spritesheet('turning_page', 'assets/images/notebook_flip.png', 1152, 754);
    },
    create: function () {
        var notebook = this.add.sprite(80, 0, 'turning_page');
        notebook.animations.add('turning_page', [0, 1, 2, 3], 6, true);

        //turning_page.animations.play('turning_page');

        var selectStyle = {font: "16px Arial", fill: "#000000", align: "left"};
        var select_9_11 = this.add.text(750, 325, 'Bush did 9/11', selectStyle);
        var select_moon_landing = this.add.text(750, 375, 'The Moon Landing was staged', selectStyle);
        var select_weather_machine = this.add.text(750, 425, 'RPI Weather Machine', selectStyle);

    },
    update: function () {}
}



