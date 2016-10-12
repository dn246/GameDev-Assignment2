//A table cleaning minigame in a seamless, endless situation room before the 9/11 crisis


var nineEleven = {

    preload: function() {
        nineEleven.load.image('9_11_background', 'assets/images/9_11_background_dark.png');
        nineEleven.load.image('9_11_table', 'assets/images/9_11_seamless_table.png');
        nineEleven.load.image('9_11_foreground', 'assets/images/9_11_seamless_foreground.png');
        nineEleven.load.image('return_button', 'assets/images/button_return_notebook.png');
        nineEleven.load.spritesheet('player_crawling', 'assets/images/9_11_player_sprite_2.png', 147, 120);
        nineEleven.load.spritesheet('trash', 'assets/images/9_11_trash_sprites.png', 92, 60);
        nineEleven.load.spritesheet('bubbles', 'assets/images/9_11_bubbles_small.png', 43, 30);
        nineEleven.load.spritesheet('tv', 'assets/images/9_11_tv_screens.png', 508, 276);

        nineEleven.load.audio('cleaning', 'assets/sounds/cleaning.wav');
        nineEleven.load.audio('clock_buzzer', 'assets/sounds/clock_buzzer.wav');
        nineEleven.load.audio('tv_click', 'assets/sounds/tv_click.wav');
    },

    create: function() {
        PLAYER_START_X = 100;
        PLAYER_START_Y = 410;
        score = 0;
        interacting = false;
        time_left = 30;

        nineEleven.world.setBounds(0, 0, 1334*(seamless_total+1), 750);

        // Add the group of backgrounds to the game
        backgrounds = nineEleven.add.group();
        backgrounds.create(0,0,'9_11_background');
        backgrounds.create(1334,0,'9_11_background');

        // Add the group of tables to the game
        tables = nineEleven.add.group();
        tables.create(0,0,'9_11_table');
        tables.create(1334,0,'9_11_table');

        // Set up m_player sprite and animation
        player = nineEleven.add.sprite (PLAYER_START_X,PLAYER_START_Y,'player_crawling');
        player.animations.add('player_crawling', [0,1,2], 5, true);
        player.animations.add('player_cleaning', [3,4,5], 10, true);
        player.anchor.setTo(0.5, 0.5);
        game.input.onDown.add(nineEleven.movePlayer, nineEleven);

        // Add the group of trash bits to the game
        trash = nineEleven.add.group();
        nineEleven.generateTrash();

        // Add the group of backgrounds to the game
        foregrounds = nineEleven.add.group();
        foregrounds.create(0,0,'9_11_foreground');
        foregrounds.create(1334,0,'9_11_foreground');

        tv = nineEleven.add.sprite(430,-273,'tv');
        tv.animations.add('video', [0,1,2,3,4,5,6,7,8], 1, true);

        // Set up text box for timer and score variable in UI
        var timeStyle = { font: "24px Lucida Console", fill: "#ffffff", align: "left"};
        timeText = nineEleven.add.text(nineEleven.camera.x+25, nineEleven.camera.y+25,
            'Time Left Until Exposure: ' + time_left.toString(), timeStyle);
        var scoreStyle = { font: "24px Lucida Console", fill: "#ffffff", align: "right"};
        scoreText = nineEleven.add.text(nineEleven.camera.x+nineEleven.camera.width-400, nineEleven.camera.y+25, 'Government filth cleaned up: 0', scoreStyle);

        // Set up game physics, keyboard input, camera fade listener
        game.physics.arcade.enable(player);
        cursors = game.input.pointer1;
        nineEleven.camera.onFadeComplete.add(nineEleven.resetFade, nineEleven);

        // Start the timer for the level
        nineEleven.time.events.add(Phaser.Timer.SECOND, nineEleven.secondTick, nineEleven);

        // Set up all the game sounds
        fx_cleaning = nineEleven.add.audio('cleaning');
        fx_clock_buzzer = nineEleven.add.audio('clock_buzzer');
        fx_tv_click = nineEleven.add.audio('tv_click');

        // Add all objects to the m_allGroup
        allGroup = nineEleven.add.group();
        allGroup.add(backgrounds);
        allGroup.add(tables);
        allGroup.add(player);
        allGroup.add(trash);
        allGroup.add(foregrounds);
        allGroup.add(timeText);
        allGroup.add(scoreText);
    },

    update: function() {
        // Set the interpolating camera to follow the m_player
        nineEleven.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);
        // Add collision to trash objects so they can be picked up
        game.physics.arcade.enable(trash);

        nineEleven.updateUI();
        nineEleven.checkEndlessGeneration();

        trash.forEach(function(t) {
                if (t.scale.x <= 0) {
                    score += 1;
                    scoreText.text = 'Government filth cleaned up: ' + score;
                    trash.remove(t);
                    t.kill();
                }
            });

        if (time_left > 0) {
            allGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        }
    },

    movePlayer: function(pointer) {
        if (!cleaning && game.input.worldY > TRASH_Y_MIN && game.input.worldY < TRASH_Y_MIN+TRASH_Y_RANGE) {
            // Cancel any movement that is currently happening
            if (tween && tween.isRunning) {
                tween.stop();
            }

            var moveX;
            // Flip the sprite and start the walking animation
            if (game.input.worldX < player.body.x) {
                player.scale.x = 1;
                moveX = game.input.worldX + 72;
            } else {
                player.scale.x = -1;
                moveX = game.input.worldX - 72;
            }
            player.animations.play('player_crawling', true);

            // Determine the time it will take to get to the pointer
            duration = (game.physics.arcade.distanceToPointer(player, pointer) / PLAYER_SPEED) * 1000;
            // Start m_tween movement towards pointer
            tween = nineEleven.add.tween(player).to({ x: moveX, y: game.input.worldY - 50}, duration, "Sine.easeInOut", true);

            // Set timers to start/stop the cleaning animation once at trash location
            if (clean_click) {
                nineEleven.time.events.add(duration, function() {
                        player.animations.play('player_cleaning', false);
                        cleaning = true;
                    }, nineEleven);
                nineEleven.time.events.add(duration+CLEAN_TIME, function() {
                        player.animations.stop('player_cleaning');
                        cleaning = false;
                    }, nineEleven);
            } else {
                nineEleven.time.events.add(duration, function() {
                        player.animations.stop('player_crawling');
                        cleaning = false;
                    }, nineEleven);
            }
        }
    },

    tapTrash: function(t) {
        if (!cleaning) {
            var i = 0;
            while (i < 3) {
                nineEleven.createBubbles(t.body.x+20+i*25,t.body.y+15+(Math.random()*25-12));
                i++;
            }

            fx_cleaning.play();

            // Shrink the piece of trash
            nineEleven.add.tween(t.scale).to({ x: 0, y: 0}, CLEAN_TIME, "Sine.easeInOut", true, duration);
        }
    },

    checkEndlessGeneration: function() {
        if (player.body.x > seamless_total * 1334) {
            seamless_total++;
            backgrounds.create(1334*seamless_total,0,'9_11_background');
            tables.create(1334*seamless_total,0,'9_11_table');
            foregrounds.create(1334*seamless_total,0,'9_11_foreground');
            nineEleven.world.setBounds(0, 0, 1334*(seamless_total+1), 750);
            nineEleven.generateTrash();

            allGroup.add(backgrounds);
            allGroup.add(tables);
            allGroup.add(trash);
            allGroup.add(foregrounds);
        }
    },

    createBubbles: function(x, y) {
        // Create bubbles particle effect
        var bubbles;
        nineEleven.time.events.add(duration, function() {
                bubbles = game.add.sprite(x, y,'bubbles');
                bubbles.animations.add('bubbles', [0,1], 5, true);
                bubbles.anchor.setTo(0.5, 0.5);
                // Tween the bubbles scale and alpha
                nineEleven.add.tween(bubbles.scale).to({ x: 1.5, y: 1.5}, CLEAN_TIME, "Sine.easeInOut", true);
                nineEleven.add.tween(bubbles).to({ alpha : 0 }, CLEAN_TIME, "Sine.easeInOut", true);
                // Set a timer to destroy the bubbles after they dissapear
                nineEleven.time.events.add(duration+CLEAN_TIME, function() {bubbles.kill}, game);
            }, game);
    },

    generateTrash: function() {
        var sub = 0, num = Math.floor(Math.random() * 5 + 5);
        for (i = 0; i < num; i++) {
            sub = Math.floor(Math.random() * 7 + 1);
            var t = trash.create((seamless_total-1)*1334+Math.floor((Math.random() * TRASH_X_RANGE) + TRASH_X_MIN), Math.floor((Math.random() * TRASH_Y_RANGE) + TRASH_Y_MIN),'trash',sub);
        }
        trash.setAll('inputEnabled', true);
        trash.setAll('input.useHandCursor', true);
        trash.forEach(function(t) {
                t.events.onInputDown.add(nineEleven.tapTrash,nineEleven);
                t.anchor.setTo(0.5, 0.5);
                t.events.onInputOver.add(function() {clean_click = true;}, nineEleven);
                t.events.onInputOut.add(function() {clean_click = false;}, nineEleven);
            });
    },

    updateUI: function() {
        // Update the text position as the camera moves
        timeText.x = nineEleven.camera.x + 25;
        timeText.y = nineEleven.camera.y + 25;
        scoreText.x = nineEleven.camera.x + nineEleven.camera.width-470;
        scoreText.y = nineEleven.camera.y + 25;
    },

    secondTick: function() {
        time_left -= 1;
        timeText.text = 'Time Left Until Exposure: ' + time_left;
        if (time_left == 0) {
            nineEleven.GameOver();
        } else {
            nineEleven.time.events.add(Phaser.Timer.SECOND, nineEleven.secondTick, nineEleven);
        }
    },

    GameOver: function() {
        fx_clock_buzzer.play();

        trash.forEach(function(t) {
            t.kill();
        });

        remote = nineEleven.add.sprite(player.body.x+300, 500,'trash',0);

        remote.inputEnabled = true;
        remote.input.useHandCursor = true;
        remote.anchor.setTo(0.5, 0.5);
        remote.events.onInputDown.add(function() {
                nineEleven.playTv();
                nineEleven.time.events.add(duration, function() {
                    remote.kill();
                }, nineEleven);
            },nineEleven);
        remote.events.onInputOver.add(function() {clean_click = true;}, nineEleven);
        remote.events.onInputOut.add(function() {clean_click = false;}, nineEleven);
    },

    playTv: function() {
        fx_tv_click.play();
        tv.x = nineEleven.camera.x+430;
        allGroup.add(tv);
        nineEleven.add.tween(tv).to({ y: 50}, 3000, "Linear", true);
        nineEleven.time.events.add(3000, function() {
            tv.animations.play('video');
            nineEleven.createReturn();
        }, nineEleven);
    },

    resetLevel: function() {
        nineEleven.fade();
        fading = true;
    },

    fade: function() {
        nineEleven.camera.fade(0x000000, 1000);
    },

    resetFade: function() {
        nineEleven.camera.resetFX();
        player.body.x = PLAYER_START_X - 83.5;
        player.body.y = PLAYER_START_Y - 57;
        fading = false;
    },

    createReturn: function() {
        var return_button = nineEleven.add.sprite(nineEleven.camera.x + 1150,600,'return_button');
        return_button.inputEnabled = true;
        return_button.events.onInputDown.add(function() {
            game.state.start('menu');
        });
        return_button.anchor.setTo(0.5, 0.5);
    },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
        return Phaser.Rectangle.intersects(boundsA, boundsB);
    }
};