//MiniGame where you play simon says with ShayJay to stop the rain



var rpi_game = {

    preload: function() {
        rpi_game.load.image('rpi_background', 'assets/images/rain_dance_background_01.png');
        rpi_game.load.image('rpi_background_light', 'assets/images/rain_dance_background_02.png');
        rpi_game.load.image('swipe_arrow', 'assets/images/rain_dance_arrow_swipe.png');
        rpi_game.load.image('return_button', 'assets/images/button_return_notebook.png');
        rpi_game.load.image('rain', 'assets/images/rain.png');
        rpi_game.load.spritesheet('player_dancing', 'assets/images/rain_dance_player_sprite.png', 136, 156);
        rpi_game.load.spritesheet('shirley_dancing', 'assets/images/rain_dance_the_honorable_sprite.png', 156, 180);

        rpi_game.load.audio('boo', 'assets/sounds/boo.wav');
        rpi_game.load.audio('cheer', 'assets/sounds/cheer.wav');
        rpi_game.load.audio('clock_buzzer', 'assets/sounds/clock_buzzer.wav');
        rpi_game.load.audio('incorrect', 'assets/sounds/incorrect.wav');
        rpi_game.load.audio('thunder_storm', 'assets/sounds/thunder_storm.wav');
        rpi_game.load.audio('click', 'assets/sounds/click.wav');
    },

    create: function() {
        // Add the group of backgrounds to the game
        backgrounds = rpi_game.add.sprite(0,0,'rpi_background');

        // Set up m_player sprite and animation
        player = rpi_game.add.sprite (445,600,'player_dancing');
        player.animations.add('dancing_left',  [6], 1, true);
        player.animations.add('dancing_down',  [3], 1, true);
        player.animations.add('dancing_right', [5], 1, true);
        player.animations.add('dancing_up',    [4], 1, true);
        player.anchor.setTo(0.5, 0.5);

        // Set up shirley's sprite and animation
        shirley = rpi_game.add.sprite (890,600,'shirley_dancing');
        shirley.animations.add('dancing_left',  [6], 1, true);
        shirley.animations.add('dancing_down',  [3], 1, true);
        shirley.animations.add('dancing_right', [5], 1, true);
        shirley.animations.add('dancing_up',    [4], 1, true);
        shirley.anchor.setTo(0.5, 0.5);

        emitter = rpi_game.add.emitter(game.world.centerX, -200, 400);
        emitter.width = rpi_game.world.width;
        //emitter.angle = 30; // uncomment to set an angle for the rain.

        emitter.makeParticles('rain');

        emitter.minParticleScale = 0.25;
        emitter.maxParticleScale = 1;

        emitter.setYSpeed(300, 500);
        emitter.setXSpeed(-5, 5);

        emitter.start(false, 1600, 5, 0);
        emitter.frequency = 500;

        // Set up text box for the score variable in UI
        var scoreStyle = { font: "24px Arial", fill: "#ffffff", align: "left"};
        scoreText = this.add.text(25, 25, 'Precipitation: 50%', scoreStyle);
        var timeStyle = { font: "24px Arial", fill: "#ffffff", align: "left"};
        timeText = this.add.text(1170, 25, 'Time Left: 10', timeStyle);
        timeText.visible = false;

        // Set up touch input
        cursors = game.input.pointer1;

        // Load sounds
        fx_boo = this.add.audio('boo');
        fx_cheer = this.add.audio('cheer');
        fx_clock_buzzer = this.add.audio('clock_buzzer');
        fx_incorrect = this.add.audio('incorrect');
        fx_thunder_storm = this.add.audio('thunder_storm');

        // Start Shirley's first turn
        this.shirleysTurn();
    },

    update: function() {
        this.checkSwipes();
    },

    playersTurn: function() {
        console.log("PLAYERS TURN");
        player_turn = true;
        timeText.visible = true;
        curr_i = 0;
        time_left = 10;

        // Start the timer for the m_player
        this.time.events.add(1000, this.secondTick, game);
    },

    secondTick: function() {
        time_left -= 1;
        fx_click.play();
        if (time_left < 0) {
            time_left = 0;
            fx_clock_buzzer.play();
        }
        timeText.text = 'Time Left: ' + time_left;
        if (time_left == 0) {
            this.updateScore(10);
            console.log("PLAYER FAIL");
            fx_incorrect.play();
            this.shirleysTurn();
        } else {
            this.time.events.add(1000, this.secondTick, game);
        }
    },

    shirleysTurn: function() {
        if (!game_over) {
            if (level + 1 == dance_moves.length) {
                this.GameOver();
                return;
            }

            fx_thunder_storm.play();

            player_turn = false;
            timeText.visible = false;
            curr_i = 0;
            your_moves = [];
            level++;

            console.log("SHIRLEYS TURN [" + your_moves + "] != [" + dance_moves[level] + "]");

            // set a timer for the total duration of all the dance moves together to change turns
            var shirleysTurn_length = MOVE_DURATION * dance_moves[level].length;
            console.log('players turn in ' + shirleysTurn_length);
            this.time.events.add(shirleysTurn_length, function() {
                this.playersTurn();
            }, game);

            this.ShirleyDanceMove();
        }
    },

    checkMoves: function() {
        if (player_turn) {
            // Check the list of moves so far you've done this turn against shirley's moves
            var same_elements = your_moves.every(function(element, index) {
                return element === dance_moves[level][index];
            });

            if (same_elements) {
                if (your_moves.length > 0 && your_moves.length == dance_moves[level].length) {
                    this.time.events.add(MOVE_DURATION, function() {
                        this.updateScore(-10);
                        fx_cheer.play();
                        console.log("PLAYER SUCCESS [" + your_moves + "] == [" + dance_moves[level] + "]");
                        this.shirleysTurn();
                    }, game);
                }
            } else {
                this.updateScore(10);
                fx_incorrect.play();
                console.log("PLAYER FAIL");
                this.shirleysTurn();
            }
        }
    },

    checkSwipes: function() {
        if (player_turn && !game_over) {
            if (can_swipe) {
                var swipeCoordX,
                    swipeCoordY,
                    swipeCoordX2,
                    swipeCoordY2,
                    swipeMinDistance = 100;
                game.input.onDown.add(function(pointer) {
                    swipeCoordX = pointer.clientX;
                    swipeCoordY = pointer.clientY;
                    }, this);
                game.input.onUp.add(function(pointer) {
                    if (can_swipe) {
                        swipeCoordX2 = pointer.clientX;
                        swipeCoordY2 = pointer.clientY;
                        console.log("P1(" + swipeCoordX + "," + swipeCoordY + ")");
                        console.log("P2(" + swipeCoordX2 + "," + swipeCoordY2 + ")");
                        if(swipeCoordX2 < swipeCoordX - swipeMinDistance){
                            your_moves.push(LEFT_ANIM);
                            this.danceMove(player, LEFT_ANIM);
                            console.log("left pushed " + LEFT_ANIM);
                        } else if(swipeCoordX2 > swipeCoordX + swipeMinDistance) {
                            your_moves.push(RIGHT_ANIM);
                            this.danceMove(player, RIGHT_ANIM);
                            console.log("right pushed " + RIGHT_ANIM);
                        } else if(swipeCoordY2 < swipeCoordY - swipeMinDistance) {
                            your_moves.push(UP_ANIM);
                            this.danceMove(player, UP_ANIM);
                            console.log("up pushed " + UP_ANIM);
                        } else if(swipeCoordY2 > swipeCoordY + swipeMinDistance) {
                            your_moves.push(DOWN_ANIM);
                            this.danceMove(player, DOWN_ANIM);
                            console.log("right pushed " + DOWN_ANIM);
                        }
                    }
                    can_swipe = false;
                    this.time.events.add(MOVE_DURATION, function() {can_swipe = true;}, this);
                }, this);
            }
        }
    },

    ShirleyDanceMove: function() {
        rpi_game.time.events.add(MOVE_DURATION * curr_i, function() {
            rpi_game.danceMove(shirley, dance_moves[level][curr_i]);
            console.log("SHIRLEY DANCE ANIM START " + dance_moves[level][curr_i]);
            curr_i++;
            if (curr_i < dance_moves[level].length) {
                rpi_game.ShirleyDanceMove();
            }
        }, game);
    },

    danceMove: function(character, i) {
        if (character == player) {
            rpi_game.time.events.add(MOVE_DURATION, rpi_game.checkMoves, game);
        } else {
            rpi_game.swipeArrow(i);
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
        var arrow = rpi_game.add.sprite(moveX,moveY,'swipe_arrow');
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
        game.add.tween(arrow).to({ x: moveX, y: moveY}, MOVE_DURATION, "Sine.easeInOut", true);
        game.add.tween(arrow.scale).to({ x: 1+curr_i/10, y: 1+curr_i/10 }, MOVE_DURATION, Phaser.Easing.Linear.None, true);
        game.add.tween(arrow).to({ alpha : 0 }, MOVE_DURATION, "Sine.easeInOut", true);
        game.time.events.add(MOVE_DURATION, function() {
            arrow.kill();
        }, rpi_game);
    },

    GameOver: function() {
        console.log('GameOver');
        game_over = true;
        player_turn = false;
        if (score == 0) {
            fx_cheer.play();
            backgrounds = rpi_game.add.sprite(0,0,'rpi_background_light');
        } else {
            fx_boo.play();
        }
        createReturn();
    },

    updateScore:function(s) {
        score += s;
        emitter.frequency = (101 - score) * 10;
        scoreText.text = 'Precipitation: ' + score + '%';
    }
}