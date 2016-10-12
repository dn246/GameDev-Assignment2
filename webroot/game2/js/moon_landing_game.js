// MiniGame for moonLanding conspiracy, basically DinerDash...

var moonLanding = {

    PLAYER_MAX_X: 1275,
    PLAYER_MAX_Y: 650,
    PLAYER_MIN_X: 65,
    PLAYER_MIN_Y: 130,
    potCups: 5,

    preload: function() {
        moonLanding.load.image('moon_set', 'assets/images/moon_landing_set.png');
        moonLanding.load.image('return_button', 'assets/images/button_return_notebook.png');
        moonLanding.load.spritesheet('player_walk', 'assets/images/mcwalkcycle.png', 118,
            211, 8);
        moonLanding.load.spritesheet('coffeeMug', 'assets/images/coffee_pot_sprite_sheet.png', 36,
            31, 6, 0, 8);
        moonLanding.load.spritesheet('cameraMan', 'assets/images/cameraman_walk_cycle.png', 129,
            208, 4 , 0 , 231);
        moonLanding.load.spritesheet('director', 'assets/images/director_walk_cycle.png', 128,
            226, 4, 0, 242);
        moonLanding.load.spritesheet('janitor', 'assets/images/janitor_walk_cycle.png', 159,
            204, 4, 0, 206);
        moonLanding.load.image('cup_refill', 'assets/images/coffee_speech_bubble.png');
        moonLanding.load.image('happy', 'assets/images/smiley_face_speech_bubble.png');
        moonLanding.load.image('sad', 'assets/images/sad_face_speech_bubble.png');
    },

    create: function() {
        //set several variables from setup to local defaults
        PLAYER_SPEED = 300;
        PLAYER_START_X = 670;
        PLAYER_START_Y = 320;
        score = 0;
        interacting = false;
        time_left = 30;

        moonLanding.world.setBounds(0, 0, 1334, 750);
        // Add the group of moon_set to the game
        backgrounds = moonLanding.add.sprite(0,0,'moon_set');

        // Set up player sprite and animation
        player = moonLanding.add.sprite (PLAYER_START_X, PLAYER_START_Y, 'player_walk');
        player.animations.add('player_walking', [0,1,2,3,4,5,6,7], 60, true);
        player.animations.add('player_idle', [0], 6, true);
        player.anchor.setTo(0.5, 0.5);
        moonLanding.input.onDown.add(moonLanding.movePlayer, moonLanding);

        //a coffee mug stuck on the player
        coffeePot = moonLanding.add.sprite (45,-45,'coffeeMug');
        coffeePot.animations.add('filling', [5,4,3,2,1,0], 2, true);
        coffeePot.animations.add('5', [0], 6, true);
        coffeePot.animations.add('4', [1], 6, true);
        coffeePot.animations.add('3', [2], 6, true);
        coffeePot.animations.add('2', [3], 6, true);
        coffeePot.animations.add('1', [4], 6, true);
        coffeePot.animations.add('0', [5], 6, true);
        player.addChild(coffeePot);


        customerGroup = moonLanding.add.group();
        //cameraman wants coffee...why doesn't he get it himself, he's on break...
        var cameraMan = moonLanding.createCustomer('cameraMan');

        //director wants coffee, better be quick
        var director = moonLanding.createCustomer('director');

        //janitor wants coffee, cool dude
        var janitor = moonLanding.createCustomer('janitor');

        // Set up text box for timer and score variable in UI
        var timeStyle = { font: "24px Arial", fill: "#000000", align: "left"};
        timeText = moonLanding.add.text(moonLanding.camera.x+25, moonLanding.camera.height-50,
            'Time Rem:' + time_left.toString(), timeStyle);
        var scoreStyle = { font: "24px Arial", fill: "#000000", align: "right"};
        scoreText = moonLanding.add.text(moonLanding.camera.x+moonLanding.camera.width-140, moonLanding.camera.height-50, 'Score: 0', scoreStyle);

        // Set up game physics, keyboard input, camera fade listener
        game.physics.arcade.enable(player);
        game.physics.arcade.enable(customerGroup);
        //cursors = moonLanding.input.pointer1;
        moonLanding.camera.onFadeComplete.add(moonLanding.resetFade, moonLanding);

        // Start the timer for the level
        moonLanding.time.events.add(Phaser.Timer.SECOND, moonLanding.secondTick, moonLanding);

        // add the elements to the allGroup for depth sorting
        allGroup = moonLanding.add.group();
        allGroup.add(player);
        allGroup.add(cameraMan);
        allGroup.add(director);
        allGroup.add(janitor);
        allGroup.add(timeText);
        allGroup.add(scoreText);
    },

    update: function() {

        if (player.x > 570 && player.x < 760 && player.y < 220){
            moonLanding.refillPot();
        }
        customerGroup.forEach(function(customer) {
            console.log(typeof customer);
            game.physics.arcade.overlap(player, customer, function(){console.log("suck it");},null, moonLanding);
        });



        moonLanding.updateUI();
        allGroup.sort('y', Phaser.Group.SORT_ASCENDING);
    },

    movePlayer: function(pointer) {
        if (!interacting) {
            interacting = true;
            // Cancel any movement that is currently happening
            if (tween && tween.isRunning) {
                tween.stop();
            }

            // Flip the sprite and start the walking animation
            if (moonLanding.input.worldX >= player.body.x) {
                player.scale.x = 1;
            } else {
                player.scale.x = -1;
            }
            player.animations.play('player_walking', true);

            // Determine the time it will take to get to the pointer
            var duration = (moonLanding.physics.arcade.distanceToPointer(player, pointer) / PLAYER_SPEED) * 1000;
            // Start tween movement towards pointer
            var tempX = moonLanding.input.worldX;
            var tempY = moonLanding.input.worldY;
            if (tempX < moonLanding.PLAYER_MIN_X) {
                tempX = moonLanding.PLAYER_MIN_X;
            }
            else if (tempX > moonLanding.PLAYER_MAX_X) {
                tempX = moonLanding.PLAYER_MAX_X;
            }
            if (tempY < moonLanding.PLAYER_MIN_Y) {
                tempY = moonLanding.PLAYER_MIN_Y;
            }
            else if (tempY > moonLanding.PLAYER_MAX_Y) {
                tempY = moonLanding.PLAYER_MAX_Y;
            }
            tween = moonLanding.add.tween(player).to({x: tempX, y: tempY}, duration, Phaser.Easing.Linear.None, true);

            // Set a timer to stop the animation
            moonLanding.time.events.add(duration, function () {
                player.animations.stop('player_walking');
                player.animations.play('player_idle');
                interacting = false;
            }, game);
        }
    },

    refillPot: function(){
        if (!interacting) {
            interacting = true;
            if (moonLanding.potCups === 0) {
                coffeePot.animations.play('filling');
                moonLanding.potCups = 5;
                coffeePot.animations.play(moonLanding.potCups.toString());
            } else {
                console.log("not at 0 cups fuck off");
            }
        }
    },

    refillCup: function () {
        if (!interacting) {
            if (moonLanding.potCups > 0) {
                moonLanding.potCups -= 1;
                coffeePot.animations.play(moonLanding.potCups.toString());
                score += 10;
                customerGroup.remove(customer);
                //customer.kill();

            } else {
                console.log("you have no coffee! GO GET SOME!!!");
            }
        }
    },

    createCustomer: function(filename){
        var x = Math.floor(Math.random()*200)+100, t_scale = 1, y = 130, side = -100;
        if (Math.random() < 0.5){
            x += 900;
            side = 1444;
            t_scale = -1;
        }
        y += Math.floor(Math.random()*520);

        var customer = moonLanding.add.sprite(side, y, filename);
        customer.animations.add(filename+'_walking',[0,1,2,3], 6, true);
        customer.animations.add(filename+'_idle',[1], 6, true);
        customer.animations.play(filename+'_walking');
        customer.anchor.setTo(.5,.5);

        //add the bubble demanding coffee and set it up to be a child of the customer
        var speech_bubble = moonLanding.add.sprite(0, -175, "cup_refill");
        customer.addChild(speech_bubble);
        customer.scale.x = t_scale;

        var duration = (moonLanding.physics.arcade.distanceToXY(customer, x, y) / PLAYER_SPEED) * 1000;
        moonLanding.add.tween(customer).to({ x:x, y:y }, duration, Phaser.Easing.Linear.None, true);
        moonLanding.time.events.add(duration, function() {
            customer.animations.stop(filename+'_walking');
            customer.animations.play(filename+'_idle');}, game);

        game.physics.arcade.enable(customer);

        customerGroup.add(customer);
        return customer;
    },

    updateUI: function() {
        // Update the text position as the camera moves
        timeText.x = moonLanding.camera.x+moonLanding.camera.width-170;
        timeText.y = moonLanding.camera.height-100;
        scoreText.x = moonLanding.camera.x+moonLanding.camera.width-170;
        scoreText.y = moonLanding.camera.height-50;
    },

    secondTick: function() {
        time_left -= 1;
        timeText.text = 'Time Rem: ' + time_left;
        if (time_left == 0) {
            moonLanding.GameOver();
        } else {
            moonLanding.time.events.add(Phaser.Timer.SECOND, moonLanding.secondTick, moonLanding);
        }
    },


    GameOver: function() {
        // TODO: show highscore table and enter highscore
        createReturn();
    },

    resetLevel: function() {
        moonLanding.fade();
        fading = true;
    },

    fade: function() {
        moonLanding.camera.fade(0x000000, 1000);
    },

    resetFade: function() {
        moonLanding.camera.resetFX();
        player.body.x = PLAYER_START_X - 50;
        player.body.y = PLAYER_START_Y - 50;
        fading = false;
    },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
        return Phaser.Rectangle.intersects(boundsA, boundsB);
    }
};