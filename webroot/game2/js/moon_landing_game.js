// MiniGame for moonLanding conspiracy, basically DinerDash...

PLAYER_SPEED = 300;
PLAYER_START_X = 670;
PLAYER_START_Y = 320;
PLAYER_MAX_X = 1275;
PLAYER_MAX_Y = 650;
PLAYER_MIN_X = 65;
PLAYER_MIN_Y = 130;

var player;
var coffeePot;
var cameraMan;
var director;
var janitor;
var moon_set;
var cursor;
var scoreText;
var timeText;
var tween;
var allGroup;

var fading = false;
var score = 0;
var time_left = 90;
var potCups = 5;

var moonLanding = {

    preload: function() {
        this.load.image('moon_set', 'assets/images/moon_landing_set.png');
        this.load.spritesheet('player_walk', 'assets/images/mcwalkcycle.png', 118,
            211, 8);
        this.load.spritesheet('coffeeMug', 'assets/images/coffee_pot_sprite_sheet.png', 36,
            31, 6, 0, 8);
        this.load.spritesheet('cameraMan', 'assets/images/cameraman_walk_cycle.png', 129,
            208, 4 , 0 , 231);
        this.load.spritesheet('director', 'assets/images/director_walk_cycle.png', 128,
            226, 4, 0, 242);
        this.load.spritesheet('janitor', 'assets/images/janitor_walk_cycle.png', 159,
            204, 4, 0, 206);
        this.load.image('pot_refill', 'assets/images/coffee_speech_bubble.png');
    },
    create: function() {
        this.world.setBounds(0, 0, 1334, 750);

        // Add the group of moon_set to the game
        moon_set = this.add.group();
        moon_set.create(0,0,'moon_set');

        // Set up player sprite and animation
        player = this.add.sprite (PLAYER_START_X,PLAYER_START_Y,'player_walk');
        player.animations.add('player_walking', [0,1,2,3,4,5,6,7], 10, true);
        player.animations.add('player_idle', [0], 6, true);
        player.anchor.setTo(0.5, 0.5);
        this.input.onDown.add(this.movePlayer, this);

        //a coffee mug stuck on the player
        coffeePot = this.add.sprite (45,-45,'coffeeMug');
        coffeePot.animations.add('filling', [5,4,3,2,1,0], 2, true);
        coffeePot.animations.add('full', [0], 6, true);
        coffeePot.animations.add('fourCup', [1], 6, true);
        coffeePot.animations.add('threeCup', [2], 6, true);
        coffeePot.animations.add('twoCup', [3], 6, true);
        coffeePot.animations.add('oneCup', [4], 6, true);
        coffeePot.animations.add('empty', [5], 6, true);
        player.addChild(coffeePot);

        //cameraman wants coffee...why doesn't he get it himself, he's on break...
        cameraMan = this.createCustomer('cameraMan');

        //director wants coffee, better be quick
        director = this.createCustomer('director');

        //janitor wants coffee, cool dude
        janitor = this.createCustomer('janitor');

        // Set up text box for timer and score variable in UI
        var timeStyle = { font: "24px Arial", fill: "#000000", align: "left"};
        timeText = this.add.text(this.camera.x+25, this.camera.height-50, 'Time Rem: 90', timeStyle);
        var scoreStyle = { font: "24px Arial", fill: "#000000", align: "right"};
        scoreText = this.add.text(this.camera.x+this.camera.width-140, this.camera.height-50, 'Score: 0', scoreStyle);

        // Set up game physics, keyboard input, camera fade listener
        this.physics.arcade.enable(player);
        //cursor = game.input.mousePointer;
        cursor = this.input.pointer1;
        this.camera.onFadeComplete.add(this.resetFade, this);

        // Start the timer for the level
        this.time.events.add(Phaser.Timer.SECOND, this.secondTick, this);

        // add the elements to the allGroup for depth sorting
        allGroup = game.add.group();
        allGroup.add(player);
        allGroup.add(cameraMan);
        allGroup.add(director);
        allGroup.add(janitor);
    },

    createCustomer: function(filename){
        var x = Math.floor(Math.random()*200)+100, t_scale = 1, y = 130, side = -100;
        if (Math.random() < 0.5){
            x += 900;
            side = 1444;
            t_scale = -1;
        }
        y += Math.floor(Math.random()*520);

        var customer = this.add.sprite(side, y, filename);
        customer.animations.add(filename+'_walking',[0,1,2,3], 6, true);
        customer.animations.add(filename+'_idle',[1], 6, true);
        customer.animations.play(filename+'_walking');
        customer.anchor.setTo(.5,.5);

        //add the bubble demanding coffee and set it up to be a child of the customer
        var speech_bubble = this.add.sprite(0, -175, "pot_refill");
        customer.addChild(speech_bubble);
        customer.scale.x = t_scale;

        var duration = (this.physics.arcade.distanceToXY(customer, x, y) / PLAYER_SPEED) * 1000;
        this.add.tween(customer).to({ x:x, y:y }, duration, Phaser.Easing.Linear.None, true);
        this.time.events.add(duration, function() {
            customer.animations.stop(filename+'_walking');
            customer.animations.play(filename+'_idle');}, this);

        return customer;
    },

    update: function() {

        if (player.x > 570 && player.x < 760 && player.y < 220){
            refillPot();
        }


        this.updateUI();
        allGroup.sort('y', Phaser.Group.SORT_ASCENDING);
    },

    movePlayer: function(pointer) {
        // Cancel any movement that is currently happening
        if (tween && tween.isRunning) {
            tween.stop();
        }

        // Flip the sprite and start the walking animation
        if (this.input.worldX >= player.body.x) {
            player.scale.x = 1;
        } else {
            player.scale.x = -1;
        }
        player.animations.play('player_walking', true);

        // Determine the time it will take to get to the pointer
        var duration = (this.physics.arcade.distanceToPointer(player, pointer) / PLAYER_SPEED) * 1000;
        // Start tween movement towards pointer
        var tempX = this.input.worldX;
        var tempY = this.input.worldY;
        if (tempX < PLAYER_MIN_X){
            tempX = PLAYER_MIN_X;
        }
        else if(tempX > PLAYER_MAX_X){
            tempX = PLAYER_MAX_X;
        }
        if (tempY < PLAYER_MIN_Y){
            tempY = PLAYER_MIN_Y;
        }
        else if(tempY > PLAYER_MAX_Y){
            tempY = PLAYER_MAX_Y;
        }
        tween = this.add.tween(player).to({ x:tempX, y:tempY }, duration, Phaser.Easing.Linear.None, true);

        // Set a timer to stop the animation
        this.time.events.add(duration, function() {
            player.animations.stop('player_walking');
            player.animations.play('player_idle');}, this);
    },

    updateUI: function() {
        // Update the text position as the camera moves
        timeText.x = this.camera.x+this.camera.width-170;
        timeText.y = this.camera.height-100;
        scoreText.x = this.camera.x+this.camera.width-170;
        scoreText.y = this.camera.height-50;
    },

    refillPot: function(){
        if (potCups === 0) {
            coffeePot.animations.play('filling');
            potCups = 5;
        } else {
            console.log("not at 0 cups");
        }
    },

    secondTick: function() {
        time_left -= 1;
        timeText.text = 'Time Rem: ' + time_left;
        if (time_left == 0) {
            this.GameOver();
        } else {
            this.time.events.add(Phaser.Timer.SECOND, this.secondTick, this);
        }
    },


    GameOver: function() {
        // TODO: show highscore table and enter highscore
        game.state.start('menu');
    },

    resetLevel: function() {
        this.fade();
        fading = true;
    },

    fade: function() {
        this.camera.fade(0x000000, 1000);
    },

    resetFade: function() {
        this.camera.resetFX();
        player.body.x = PLAYER_START_X - 50;
        player.body.y = PLAYER_START_Y - 50;
        fading = false;
    },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
        return Phaser.Rectangle.intersects(boundsA, boundsB);
    }
}