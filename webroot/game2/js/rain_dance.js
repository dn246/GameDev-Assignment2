//MiniGame where you play simon says with ShayJay to stop the rain

var rain_dance = {

    preload: function() {
        rain_dance.load.image('rpi_background', 'assets/images/rain_dance_background_01.png');
        rain_dance.load.image('rpi_background_light', 'assets/images/rain_dance_background_02.png');
        rain_dance.load.image('swipe_arrow', 'assets/images/rain_dance_arrow_swipe.png');
        rain_dance.load.image('return_button', 'assets/images/button_return_notebook.png');
        rain_dance.load.image('rain', 'assets/images/rain.png');
        rain_dance.load.spritesheet('player_dancing', 'assets/images/rain_dance_player_sprite.png', 136, 156);
        rain_dance.load.spritesheet('shirley_dancing', 'assets/images/rain_dance_the_honorable_sprite.png', 156, 180);

        rain_dance.load.audio('boo', 'assets/sounds/boo.wav');
        rain_dance.load.audio('ding', 'assets/sounds/ding.wav');
        rain_dance.load.audio('cheer', 'assets/sounds/cheer.wav');
        rain_dance.load.audio('clock_buzzer', 'assets/sounds/clock_buzzer.wav');
        rain_dance.load.audio('incorrect', 'assets/sounds/incorrect.wav');
        rain_dance.load.audio('thunder_storm', 'assets/sounds/thunder_storm.wav');
        rain_dance.load.audio('click', 'assets/sounds/click.wav');
        rain_dance.load.audio('hipHop', 'assets/sounds/hip_hop_loop.wav');
    },

    init: function () {
        fx_main_music.stop();
        score = 50;
        interacting = false;
        game_over = false;

        cursors = rain_dance.input.pointer1;

        // Load sounds
        fx_boo = rain_dance.add.audio('boo');
        fx_cheer = rain_dance.add.audio('cheer');
        fx_clock_buzzer = rain_dance.add.audio('clock_buzzer');
        fx_incorrect = rain_dance.add.audio('incorrect');
        fx_thunder_storm = rain_dance.add.audio('thunder_storm');
        fx_click = rain_dance.add.audio('click');
        fx_ding = rain_dance.add.audio('ding');
        fx_hipHop = rain_dance.add.audio('hipHop', 1,true);
    },

    create: function() {
        rain_dance.init();

        // loop the music
        fx_hipHop.play();

        // Add the group of backgrounds to the game
        backgrounds = rain_dance.add.sprite(0,0,'rpi_background');

        // Set up m_player sprite and animation
        player = rain_dance.add.sprite (445,600,'player_dancing');
        player.animations.add('dancing_left',  [6], 1, true);
        player.animations.add('dancing_down',  [3], 1, true);
        player.animations.add('dancing_right', [5], 1, true);
        player.animations.add('dancing_up',    [4], 1, true);
        player.anchor.setTo(0.5, 0.5);

        // Set up shirley's sprite and animation
        shirley = rain_dance.add.sprite (890,600,'shirley_dancing');
        shirley.animations.add('dancing_left',  [6], 1, true);
        shirley.animations.add('dancing_down',  [3], 1, true);
        shirley.animations.add('dancing_right', [5], 1, true);
        shirley.animations.add('dancing_up',    [4], 1, true);
        shirley.anchor.setTo(0.5, 0.5);

        emitter = rain_dance.add.emitter(rain_dance.world.centerX, -200, 400);
        emitter.width = rain_dance.world.width;
        //emitter.angle = 30; // uncomment to set an angle for the rain.

        emitter.makeParticles('rain');

        emitter.minParticleScale = 0.25;
        emitter.maxParticleScale = 1;

        emitter.setYSpeed(300, 500);
        emitter.setXSpeed(-5, 5);

        emitter.start(false, 1600, 5, 0);
        emitter.frequency = 50;

        // Set up text box for the score variable in UI
        var scoreStyle = { font: "24px Arial", fill: "#ffffff", align: "left"};
        scoreText = rain_dance.add.text(25, 25, 'Precipitation: 50%', scoreStyle);

        // Start Shirley's first turn
        rain_dance.shirleysTurn();
    },

    update: function() {
        rain_dance.checkSwipes();
    },

    flashText: function(c) {
        var switch_turnsStyle = { font: "40px Arial", fill: "#ffffff", align: "center"};
        switch_turns = rain_dance.add.text(667, 375, c, switch_turnsStyle);
        switch_turns.anchor.setTo(0.5,0.5);
        rain_dance.add.tween(switch_turns.scale).to({ x: 2, y: 2 }, 1000, Phaser.Easing.Linear.None, true);
        rain_dance.add.tween(switch_turns).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
        rain_dance.time.events.add(1000, function() {
            switch_turns.kill();
        }, game);
    },

    playersTurn: function() {
        console.log("PLAYERS TURN");
        player_turn = true;
        curr_i = 0;
        time_left = 10;

        rain_dance.flashText('Player\'s Turn');
    },

    shirleysTurn: function() {
        if (!game_over) {
            if (level + 1 == dance_moves.length) {
                rain_dance.GameOver();
                return;
            }

            player_turn = false;
            curr_i = 0;
            your_moves = [];
            level++;

            console.log("SHIRLEYS TURN [" + your_moves + "] != [" + dance_moves[level] + "]");

            // set a timer for the total duration of all the dance moves together to change turns
            var shirleysTurn_length = MOVE_DURATION * dance_moves[level].length;
            if (level == 2) {
                shirleysTurn_length += MOVE_DURATION;
            } else if (level == 3) {
                shirleysTurn_length += 3 * MOVE_DURATION;
            }
            console.log('players turn in ' + shirleysTurn_length);
            rain_dance.time.events.add(shirleysTurn_length, function() {
                rain_dance.playersTurn();
            }, game);

            rain_dance.ShirleyDanceMove();
        }
    },

    checkMoves: function() {
        if (player_turn) {
            // Check the list of moves so far you've done this turn against shirley's moves
            var same_elements = your_moves.every(function(element, index) {
                return element === dance_moves[level][index];
            });

            if (your_moves.length > dance_moves[level].length) {
                rain_dance.updateScore(15);
                console.log("PLAYER FAIL");
                rain_dance.flashText('You Failed! Shirley\'s Turn');
                rain_dance.time.events.add(1000, function() {
                    rain_dance.shirleysTurn();
                }, game);
                return;
            }

            if (same_elements) {
                if (your_moves.length > 0 && your_moves.length == dance_moves[level].length) {
                    rain_dance.time.events.add(MOVE_DURATION, function() {
                        rain_dance.updateScore(-15);
                        console.log("PLAYER SUCCESS [" + your_moves + "] == [" + dance_moves[level] + "]");
                        if (score > 0) {
                            rain_dance.flashText('Good Job! Shirley\'s Turn');
                        }
                        rain_dance.time.events.add(1000, function() {
                            rain_dance.shirleysTurn();
                        }, game);
                    }, game);
                    return;
                }
            } else {
                rain_dance.updateScore(15);
                console.log("PLAYER FAIL");
                rain_dance.flashText('You Failed! Shirley\'s Turn');
                rain_dance.time.events.add(1000, function() {
                    rain_dance.shirleysTurn();
                }, game);
                return;
            }
        }
    },

    checkSwipes: function() {
        if (player_turn && !game_over) {
            if (can_swipe) {
                var swipedX,
                    swipedY,
                    swipedX2,
                    swipedY2,
                    swipeMinDistance = 100;
                rain_dance.input.onDown.add(function(pointer) {
                    swipedX = pointer.clientX;
                    swipedY = pointer.clientY;
                }, rain_dance);
                rain_dance.input.onUp.add(function(pointer) {
                    if (can_swipe) {
                        swipedX2 = pointer.clientX;
                        swipedY2 = pointer.clientY;
                        if(swipedX2 < swipedX - swipeMinDistance){
                            your_moves.push(LEFT_ANIM);
                            rain_dance.danceMove(player, LEFT_ANIM);
                        } else if(swipedX2 > swipedX + swipeMinDistance) {
                            your_moves.push(RIGHT_ANIM);
                            rain_dance.danceMove(player, RIGHT_ANIM);
                        } else if(swipedY2 < swipedY - swipeMinDistance) {
                            your_moves.push(UP_ANIM);
                            rain_dance.danceMove(player, UP_ANIM);
                        } else if(swipedY2 > swipedY + swipeMinDistance) {
                            your_moves.push(DOWN_ANIM);
                            rain_dance.danceMove(player, DOWN_ANIM);
                        }
                    }
                    can_swipe = false;
                    rain_dance.time.events.add(MOVE_DURATION, function() {can_swipe = true;}, rain_dance);
                }, rain_dance);
            }
        }
    },

    ShirleyDanceMove: function() {
        rain_dance.time.events.add(MOVE_DURATION * curr_i, function() {
            rain_dance.danceMove(shirley, dance_moves[level][curr_i]);
            console.log("SHIRLEY DANCE ANIM START " + dance_moves[level][curr_i]);
            curr_i++;
            if (curr_i < dance_moves[level].length) {
                rain_dance.ShirleyDanceMove();
            }
        }, game);
    },

    danceMove: function(character, i) {
        if (character == player) {
            rain_dance.time.events.add(MOVE_DURATION, rain_dance.checkMoves, game);
            if (your_moves[your_moves.length-1] == dance_moves[level][your_moves.length-1]) {
                fx_ding.play();
            } else {
                fx_incorrect.play();
            }
        } else {
            rain_dance.swipeArrow(i);
        }

        if (i == 0) {
            character.animations.play('dancing_left');
        } else if (i == 1) {
            character.animations.play('dancing_down');
        } else if (i == 2) {
            character.animations.play('dancing_right');
        } else if (i == 3) {
            character.animations.play('dancing_up');
        }
    },

    swipeArrow:function(dir) {
        var moveX = 667, moveY = 375;
        var arrow = rain_dance.add.sprite(moveX,moveY,'swipe_arrow');
        arrow.anchor.setTo(0.5,0.5);
        arrow.scale.x = 0;
        arrow.scale.y = 0;
        if (dir == RIGHT_ANIM) {
            arrow.angle = 0;
            moveX = 1334-400;
            arrow.x -= 200;
        } else if (dir == UP_ANIM) {
            arrow.angle = 270;
            moveY = 0;
        } else if (dir == LEFT_ANIM) {
            arrow.angle = 180;
            moveX = 400;
            arrow.x += 200;
        } else if (dir == DOWN_ANIM) {
            arrow.angle = 90;
            moveY = 750;
        }
        rain_dance.add.tween(arrow).to({ x: moveX, y: moveY}, MOVE_DURATION, "Sine.easeInOut", true);
        rain_dance.add.tween(arrow.scale).to({ x: 1+curr_i/10, y: 1+curr_i/10 }, MOVE_DURATION, Phaser.Easing.Linear.None, true);
        rain_dance.add.tween(arrow).to({ alpha : 0 }, MOVE_DURATION, "Sine.easeInOut", true);
        rain_dance.time.events.add(MOVE_DURATION, function() {
            arrow.kill();
        }, game);
    },

    GameOver: function() {
        console.log('GameOver');
        game_over = true;
        player_turn = false;
        if (score <= 0) {
            fx_cheer.play();
            rain_dance.flashText('Congratulations! You thwarted Shirley!');
            backgrounds = rain_dance.add.sprite(0,0,'rpi_background_light');
        } else {
            rain_dance.flashText('Shirley Prevailed! You Lose!');
            fx_boo.play();
        }
        fx_hipHop.stop();
        fx_main_music.play();
        createReturn();
    },

    updateScore: function(s) {
        score += s;
        emitter.frequency = score + 1;
        scoreText.text = 'Precipitation: ' + score + '%';

        if (score <= 0) {
            rain_dance.GameOver();
        }
    }
};