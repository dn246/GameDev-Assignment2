// MiniGame for moonLanding conspiracy, basically DinerDash...

var moonLanding = {

    PLAYER_MAX_X: 1275,
    PLAYER_MAX_Y: 650,
    PLAYER_MIN_X: 65,
    PLAYER_MIN_Y: 130,
    potCups: 5,
    defCamera: 200,
    cameraTimer: 0,
    defJanitor: 400,
    janitorTimer: 400,
    defDirector: 1300,
    directorTimer: 1300,

    preload: function() {
        //IMAGES
        moonLanding.load.image('moon_set', 'assets/images/moon_landing_set.png');
        moonLanding.load.image('return_button', 'assets/images/button_return_notebook.png');
        moonLanding.load.image('cup_refill', 'assets/images/coffee_speech_bubble.png');
        moonLanding.load.image('cup_button', 'assets/images/coffee_button.png');
        moonLanding.load.image('happy', 'assets/images/smiley_face_speech_bubble.png');
        moonLanding.load.image('sad', 'assets/images/sad_face_speech_bubble.png');
        //SPRITES
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
        //AUDIO
        moonLanding.load.audio('pour','assets/sounds/coffee_pour.wav');
        moonLanding.load.audio('quote','assets/sounds/moon_quote.wav');
        moonLanding.load.audio('buzzer','assets/sounds/clock_buzzer.wav');
        moonLanding.load.audio('ding','assets/sounds/ding.wav');
        moonLanding.load.audio('shortPour','assets/sounds/Coffee_Pour_short.wav')
    },

    init: function () {
        // Global variable redefinition
        PLAYER_START_X = 670;
        PLAYER_START_Y = 320;
        score = 0;
        interacting = false;
        time_left = 30;
        game_over = false;


        // Set up all the game sounds
        fx_cofee_pour = moonLanding.add.audio('pour');
        fx_moon_guote = moonLanding.add.audio('quote');
        fx_clock_buzzer = moonLanding.add.audio('buzzer');
        fx_ding = moonLanding.add.audio('ding');
        fx_short_pour = moonLanding.add.audio('shortPour');

        cursors = moonLanding.input.pointer1;

        // Set up text box for timer and score variable in UI
        var timeStyle = { font: "24px Arial", fill: "#000000", align: "left"};
        timeText = moonLanding.add.text(moonLanding.camera.x+moonLanding.camera.width-170,
            moonLanding.camera.height-100, 'Time Rem:' + time_left.toString(), timeStyle);
        var scoreStyle = { font: "24px Arial", fill: "#000000", align: "right"};
        scoreText = moonLanding.add.text(moonLanding.camera.x+moonLanding.camera.width-140,
            moonLanding.camera.height-50, 'Score: 0', scoreStyle);

    },

    create: function() {
        //set several variables from setup to local defaults
        moonLanding.init();

        moonLanding.world.setBounds(0, 0, 1334, 750);
        backgrounds = moonLanding.add.sprite(0,0,'moon_set');

        // Set up player sprite and animation
        player = moonLanding.add.sprite (PLAYER_START_X, PLAYER_START_Y, 'player_walk');
        player.animations.add('player_walking', [0,1,2,3,4,5,6,7], 60, true);
        player.animations.add('player_idle', [0], 6, true);
        player.anchor.setTo(0.5, 0.5);
        moonLanding.input.onUp.add(moonLanding.movePlayer, moonLanding);

        //a coffee mug stuck on the player
        coffeePot = moonLanding.add.sprite (45,-45,'coffeeMug');
        coffeePot.animations.add('filling', [5,4,3,2,1,0], 2, false);
        coffeePot.animations.add('5', [0], 6, true);
        coffeePot.animations.add('4', [1], 6, true);
        coffeePot.animations.add('3', [2], 6, true);
        coffeePot.animations.add('2', [3], 6, true);
        coffeePot.animations.add('1', [4], 6, true);
        coffeePot.animations.add('0', [5], 6, true);
        player.addChild(coffeePot);
        coffeePot.animations.play(moonLanding.potCups.toString());


        customerGroup = moonLanding.add.group();

        // Set up game physics, keyboard input, camera fade listener
        game.physics.arcade.enable(player);
        game.physics.arcade.enable(customerGroup);
        moonLanding.camera.onFadeComplete.add(moonLanding.resetFade, moonLanding);

        // Start the timer for the level
        moonLanding.time.events.add(Phaser.Timer.SECOND, moonLanding.secondTick, moonLanding);

        // add the elements to the allGroup for depth sorting
        allGroup = moonLanding.add.group();
        allGroup.add(player);
        allGroup.add(timeText);
        allGroup.add(scoreText);
        allGroup.add(customerGroup);
    },

    update: function() {
        if (!game_over) {
            if (time_left === 2){
                fx_clock_buzzer.play();
            }
            moonLanding.cameraTimer--;
            moonLanding.janitorTimer--;
            moonLanding.directorTimer--;
            if (moonLanding.cameraTimer <= 0) {
                moonLanding.createCustomer('cameraMan');
                moonLanding.cameraTimer = moonLanding.defCamera;
            }
            if (moonLanding.janitorTimer <= 0) {
                moonLanding.createCustomer('janitor');
                moonLanding.janitorTimer = moonLanding.defJanitor;
            }
            if (moonLanding.directorTimer <= 0) {
                moonLanding.createCustomer('director');
                moonLanding.directorTimer = moonLanding.defDirector;
            }


            if (player.x > 570 && player.x < 760 && player.y < 220) {
                moonLanding.refillPot();
            }
            customerGroup.forEach(function (customer) {
                if (customer.leaving === false) {
                    if (!game.physics.arcade.overlap(player, customer, function () {
                            customer.speech.loadTexture("cup_button", 0, false);
                            customer.inputEnabled = true;
                            customer.events.onInputDown.add(moonLanding.refillCup, customer);

                        }, null, customer)) {
                        //SUPER HELLA INEFFICIENT...
                        customer.speech.loadTexture("cup_refill", 0, false);
                        customer.inputEnabled = false;
                    }
                }
            });
        }

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
            duration = (moonLanding.physics.arcade.distanceToPointer(player, pointer) / PLAYER_SPEED) * 1000;
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
            tween = moonLanding.add.tween(player).to({x: tempX, y: tempY}, duration,
                Phaser.Easing.Linear.None, true);

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
            if (moonLanding.potCups <= 0) {
                interacting = true;
                fx_cofee_pour.play();
                duration = 100;

                tween = moonLanding.add.tween(player).to({x: 735, y: 170}, duration,
                    Phaser.Easing.Linear.None, true);

                player.scale.x = -1;
                coffeePot.animations.play('filling');
                coffeePot.animations.currentAnim.onComplete.add(function () {
                    interacting = false;
                    moonLanding.potCups = 5;
                    coffeePot.animations.play(moonLanding.potCups.toString());
                }, moonLanding);
            } else {
                console.log("not at 0 cups fuck off");
            }
        }
    },

    refillCup: function (customer) {
        if (!interacting) {
            interacting = true;
            if (moonLanding.potCups > 0) {
                moonLanding.potCups -= 1;
                fx_short_pour.play();
                coffeePot.animations.play(moonLanding.potCups.toString());
                score += 10;
                scoreText.text = 'Score: ' + score;
                moonLanding.customerLeave(customer,'happy');

            } else {
                console.log("you have no coffee! GO GET SOME!!!");
                fx_ding.play();
            }
            interacting = false;
        }
    },
    
    customerLeave: function (customer, emotion) {
        customer.leaving = true;
        customer.speech.loadTexture(emotion, 0, false);
        var x = 1444;
        if (customer.scale.x === 1){
            x = -100;
        }
        customer.scale.x *= -1;
        customer.animations.play(customer.filename+'_walking');
        var duration = (moonLanding.physics.arcade.distanceToXY(customer, x, customer.y) / PLAYER_SPEED) * 2000;
        moonLanding.add.tween(customer).to({ x:x, y:customer.y }, duration, Phaser.Easing.Linear.None, true);
        moonLanding.time.events.add(duration, function() {
            customerGroup.remove(customer);
            customer.kill();
        }, game);
    },

    createCustomer: function(filename){
        var x = Math.floor(Math.random()*200)+100, t_scale = 1, y = 175, side = -100;
        if (Math.random() < 0.5){
            x += 900;
            side = 1444;
            t_scale = -1;
        }
        y += Math.floor(Math.random()*460);

        var customer = moonLanding.add.sprite(side, y, filename);
        customer.animations.add(filename+'_walking',[0,1,2,3], 6, true);
        customer.animations.add(filename+'_idle',[1], 6, true);
        customer.animations.play(filename+'_walking');
        customer.anchor.setTo(.5,.5);

        //add the bubble demanding coffee and set it up to be a child of the customer
        var speech_bubble = moonLanding.add.sprite(0, -175, "cup_refill");
        customer.speech = customer.addChild(speech_bubble);

        //used for showing happy or sad face when leaving and animation
        customer.leaving = false;
        customer.filename = filename;

        //sets the customer to be facing the right way now
        customer.scale.x = t_scale;

        //walks the character from off the screen back on
        var duration = (moonLanding.physics.arcade.distanceToXY(customer, x, y) / PLAYER_SPEED) * 2000;
        moonLanding.add.tween(customer).to({ x:x, y:y }, duration, Phaser.Easing.Linear.None, true);
        moonLanding.time.events.add(duration, function() {
            customer.animations.stop(filename+'_walking');
            customer.animations.play(filename+'_idle');}, game);

        game.physics.arcade.enable(customer);

        customerGroup.add(customer);
        return customer;
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
        game_over = true;
        fx_moon_guote.play();

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