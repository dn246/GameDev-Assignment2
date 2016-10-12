//menu for the overall conspiracy theory game

var mainMenu = {
    notebook: null,
    startX: 0,
    endX: 0,
    directionsText: null,
    titleText: null,
    gamePicture: null,
    pages:[
        function () {
            //stuff for first page? swipe instructions?
            mainMenu.directionsText = mainMenu.add.text(125,275,'I managed to stash this notebook' +
                ' under my shirt before being returned to my room and beaten. They stopped the ' +
                'needles and pills after that, and instead began taking me with them through the ' +
                'portal. We visited several key events, and I was sent to serve as an assistant' +
                ' while the men in suits fulfilled whatever it was they wanted.' +
                '\nThese are my stories.', bookTextStyle);
            mainMenu.titleText = mainMenu.add.text(725, 325, 'Swipe from right to left to go to' +
                ' the next page. Swipe from left to right to go to the previous page.' +
                '\nEach game is played by pressing the screen or swiping', bookTextStyle);
        },
        function () {
            mainMenu.directionsText = mainMenu.add.text(125, 275, 'The September 11th attacks ' +
                'were a global tragedy. However, when several documents were leaked revealing it' +
                ' to be a government plot, the people rioted. Because the suits no longer trusted' +
                ' me they took me back in time with them. They wanted to make sure those documents' +
                ' never saw the light of day. While they raided the building where the documents' +
                ' were held,they left me in the halls posing as a janitor.', bookTextStyle);
            mainMenu.titleText = mainMenu.add.text(800, 175, '9/11 was done by George Bush!', bookTitleStyle);
            mainMenu.gamePicture = mainMenu.clickMiniGame(950, 400, '9/11pic', '9/11');
        },
        function () {
            mainMenu.directionsText = mainMenu.add.text(125, 275, 'The Moon Landing was one of the' +
                ' most monumental events of the 20th century. When people carefully analyzed the ' +
                'video and found it to be fake, it was an embarrassment on a national level. Having' +
                ' lost trust in me, the suits took me back in time with them to re-film the iconic' +
                ' event, this time with the benefit of modern computers and special effects. I was' +
                ' given the enormous responsibility of serving coffee.', bookTextStyle);
            mainMenu.titleText = mainMenu.add.text(800, 175, 'The moon landing was Staged!', bookTitleStyle);
            mainMenu.gamePicture = mainMenu.clickMiniGame(950, 400, 'moon_landing', 'moon');
        },
        function () {
            mainMenu.directionsText = mainMenu.add.text(125, 275, 'Going back again, we ended ' +
                'up at RPI in Troy, New York. The school president had built a weather machine' +
                ' which she planned to use to drown the world. She wanted to use a powerful, ' +
                'ancient rain dance to summon the storm. Sadly for myself and everyone watching,' +
                ' I was sent out to counter it.', bookTextStyle);
            mainMenu.titleText = mainMenu.add.text(725, 175, 'Shirley Ann Jackson weather machine Flood!', bookTitleStyle);
            mainMenu.gamePicture = mainMenu.clickMiniGame(950, 400, 'rain', 'rain');
        },
    ],
    preload: function () {
        game.load.spritesheet('turning_page', 'assets/images/notebook_flip.png', 1146, 754);
        game.load.image('return_button', 'assets/images/button_return_notebook.png');
        game.load.image('moon_landing','assets/images/menu_moon_landing_b.png');
        game.load.image('9/11pic','assets/images/9_11_tv_slide1.png');
        game.load.image('rain','assets/images/bouncer_breathe_sprite.png');
    },
    create: function () {
        mainMenu.notebook = mainMenu.add.sprite(80, 0, 'turning_page');
        mainMenu.notebook.animations.add('right_turn', [0, 1, 2, 3, 0], 4);
        mainMenu.notebook.animations.add('left_turn', [0, 3, 2, 1, 0], 4);

        //notebook.animations.play('left_turn');
        mainMenu.pages[currentPage]();
        /*mainMenu.add.text(800, 175, 'The moon landing was Staged!', bookTitleStyle);
        mainMenu.clickMiniGame(950, 400, 'moon_landing', 'moon');*/

        /*var selectStyle = {font: "16px Arial", fill: "#000000", align: "left"};
        var select_9_11 = mainMenu.add.text(750, 325, 'Bush did 9/11', selectStyle);
        var select_moon_landing = mainMenu.add.text(750, 375, 'The Moon Landing was staged', selectStyle);
        var select_weather_machine = mainMenu.add.text(750, 425, 'RPI Weather Machine', selectStyle);*/
        mainMenu.input.onDown.add(mainMenu.beginSwipe, this);
        mainMenu.input.onUp.add(mainMenu.endSwipe, this);
    },

    update: function () {
    },

    beginSwipe: function () {
        mainMenu.startX = mainMenu.input.worldX;
    },

    endSwipe: function () {
        mainMenu.endX = mainMenu.input.worldX;
        var length = mainMenu.endX - mainMenu.startX;
        if (length > MINIMUM_SWIPE){
            mainMenu.previousPage();
        } else if (length < -MINIMUM_SWIPE){
            mainMenu.nextPage();
        }
    },

    clearPage: function () {
        if (mainMenu.directionsText != null){
            mainMenu.directionsText.destroy();
        }
        if (mainMenu.titleText != null){
            mainMenu.titleText.destroy();
        }
        if (mainMenu.gamePicture != null){
            mainMenu.gamePicture.destroy();
        }
    },

    nextPage: function () {
        if (currentPage < 3){
            currentPage++;
            mainMenu.clearPage();
            mainMenu.notebook.animations.play('right_turn');
            mainMenu.pages[currentPage]();
        }

    },

    previousPage: function () {
        if (currentPage > 0){
            currentPage--;
            mainMenu.clearPage();
            mainMenu.notebook.animations.play('left_turn');
            mainMenu.pages[currentPage]();
        }
    },

    clickMiniGame: function (x,y, pic, state) {
        var miniGameBtn = mainMenu.add.sprite(x, y, pic);
        miniGameBtn.inputEnabled = true;
        miniGameBtn.events.onInputUp.add(function() {
            game.state.start(state);
        });
        miniGameBtn.anchor.setTo(0.5, 0.5);
        return miniGameBtn;
    }
};