//holder for all of the cutscenes, plays them at start of game, click to continue

var cutScenes = {

    currentFrame: 0,
    storyText: null,
    foregroundImage: null,
    introSlides:[
        function () {
            cutScenes.storyText = cutScenes.add.text(900,500,"I was born in the Summer of 2003," +
                " or so I'm told. It was the same year several key ethics laws mysteriously " +
                "disappeared from the books. \nI was pulled from my sobbing mother's arms and" +
                " taken by the US Government. I've never known anything about her. They've " +
                "never told me. ",cutSceneStyle);
            cutScenes.foregroundImage = cutScenes.add.image(0, 0, '1');
        },
        function () {
            cutScenes.storyText = cutScenes.add.text(900,500,"I never knew why they took me, " +
                "of all people. I grew up entirely within off-white walls with neon " +
                "bulbs over my head.",cutSceneStyle);
            cutScenes.foregroundImage = cutScenes.add.image(0, 0, '2');
        },
        function () {
            cutScenes.storyText = cutScenes.add.text(900,500,"Anything I needed was brought to me. " +
                "I could never leave. Food, education, medicine, entertainment...It was all there," +
                " and I wanted for nothing.\nThe first several years were fine, if not a bit" +
                " boring.",cutSceneStyle);
            cutScenes.foregroundImage = cutScenes.add.image(0, 0, '3');
        },
        function () {
            cutScenes.storyText = cutScenes.add.text(900,450,"After my tenth birthday they began strapping me into a chair a" +
                " few times a month and sticking needles in me or forcing me to down pills. \n" +
                "I became very ill frequently, at times to the point of near death.\nI felt as though" +
                " I could feel the cold, uncaring security camera in the corner of my room laughing " +
                "at me whenever I collapsed onto the floor. ",cutSceneStyle);
            cutScenes.foregroundImage = cutScenes.add.image(0, 0, '4');
        },
        function () {
            cutScenes.storyText = cutScenes.add.text(900,500,"One night, the suited man who brought" +
                " me my dinner forgot to lock the door, and I made my attempt at escape.",cutSceneStyle);
            cutScenes.foregroundImage = cutScenes.add.image(0, 0, '5');
        },
        function () {
            cutScenes.storyText = cutScenes.add.text(900,450,"While trying to find my way out I " +
                "stumbled into an office, where I discovered a strange, large circular device.\n" +
                "Papers spread around the office revealed this to be a real life time machine. " +
                "I could hardly believe it.\nPerhaps I should have. Maybe If I had not been" +
                " so floored I would have noticed the footsteps behind me.",cutSceneStyle);
            cutScenes.foregroundImage = cutScenes.add.image(0, 0, '6');
        }
    ],
    preload: function () {
        game.load.spritesheet('background','assets/images/intro_background.png',1334,750);
        game.load.image('1','assets/images/intro_scene01.png');
        game.load.image('2','assets/images/intro_scene02.png');
        game.load.image('3','assets/images/intro_scene03.png');
        game.load.image('4','assets/images/intro_scene04.png');
        game.load.image('5','assets/images/intro_scene05.png');
        game.load.image('6','assets/images/intro_scene06.png');
    },

    create: function () {
        backgrounds = cutScenes.add.sprite(0, 0, 'background');
        cutScenes.introSlides[cutScenes.currentFrame]();


        game.input.onUp.add(cutScenes.nextScreen);

    },

    clearSlide: function () {
        if (cutScenes.storyText != null){
            cutScenes.storyText.destroy();
        }
        if (cutScenes.foregroundImage != null){
            cutScenes.foregroundImage.destroy();
        }
    },

    nextScreen: function () {
        if (cutScenes.currentFrame<5){
            console.log(cutScenes.currentFrame)
            cutScenes.currentFrame++;
            cutScenes.clearSlide();
            cutScenes.introSlides[cutScenes.currentFrame]();
        }else{
            game.state.start('menu');
        }
    }
};
