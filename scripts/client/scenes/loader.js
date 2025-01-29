class LoaderBackground extends Phaser.Scene {
    constructor() {
        super({key: 'loaderbackground'});
    }

    preload(){
        this.load.image('background', 'assets/backgrounds/background.png');
        this.load.image('background2', 'assets/backgrounds/background2.jpg');
        this.load.image('background3', 'assets/backgrounds/background3.jpg');
        this.load.image('logo', 'assets/logo.jpg');
    }

    create(){
        this.scene.start('loader');
    }
}

class Loader extends Phaser.Scene {
    constructor() {
        super({key: 'loader'});
    }

    preload(){
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.image(screenCenterX, screenCenterY, 'background').setScale(1);
        this.add.image(screenCenterX, screenCenterY, 'background2').setScale(2);
        this.add.image(screenCenterX, screenCenterY-320, 'logo').setOrigin(0.5, 0.5).setScale(1);

        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(OP_RED, 0.2);
        progressBox.fillRect(screenCenterX-160, screenCenterY+70, 320, 50);

        let loadingText = this.make.text({
            x : screenCenterX,
            y : screenCenterY+50,
            text: "Loading...",
            style: {
                fontFamily: 'Brandon',
                font: "24px monospace",
                fill: "#E9E6CE"
            }
        });
        loadingText.setOrigin(0.5, 0.5);
  
        let percentText = this.make.text({
            x : screenCenterX,
            y : screenCenterY+70+25,
            text: "0%",
            style: {
                fontFamily: 'Brandon',
                font: "18px monospace",
                fill: "#E9E6CE"
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + "%");
            progressBar.clear();
            progressBar.fillStyle(OP_RED, 1);
            progressBar.fillRect(screenCenterX-150, screenCenterY+80, 300 * value, 30);
        });

        this.load.on('fileprogress', function(file) {
            //assetText.setText("loading asset: " + file.key);
        });
        this.load.on('complete', function() {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        this.load.json('card_data', 'assets/data/opcards.json'); //Card Database
        this.load.json('icon_data', 'assets/data/playericons.json'); //icon list
        
        this.load.image('rightarrow', 'assets/elements/rightarrow.png');
        this.load.image('leftarrow', 'assets/elements/leftarrow.png');

        this.load.image('storeIcon', 'assets/icons/menuicons/storeIcon.png');
        this.load.image('openPackIcon', 'assets/icons/menuicons/openPackIcon.png');
        this.load.image('logoutIcon', 'assets/icons/menuicons/logoutIcon.png');
        this.load.image('randomMatchIcon', 'assets/icons/menuicons/randomMatchIcon.png');
        this.load.image('vsAIIcon', 'assets/icons/menuIcons/vsAIIcon.png');
        this.load.image('collectionIcon', 'assets/icons/menuIcons/collectionIcon.png');

        this.load.image('default_avatar', 'assets/icons/playericons/icon1.png');
        this.load.image('ai_avatar', 'assets/icons/playericons/icon1.png');
        
        this.load.image('card_back1', 'assets/backart/sleeve-0.png');
        this.load.image('card_back2', 'assets/backart/don-sleeve-0.png');

        this.load.image('packart_OP01', 'assets/packart/OP01.png');
        this.load.image('packart_OP02', 'assets/packart/OP02.png');
        this.load.image('packart_OP02', 'assets/packart/OP03.png');
        this.load.image('packart_ST01', 'assets/packart/ST01.png');
        this.load.image('packart_ST02', 'assets/packart/ST02.png');
        this.load.image('packart_ST03', 'assets/packart/ST03.png');
        this.load.image('packart_ST04', 'assets/packart/ST04.png');

        this.load.image('op_RED_symbol', 'assets/icons/colorsymbols/OP_RED.png');
        this.load.image('op_GREEN_symbol', 'assets/icons/colorsymbols/OP_GREEN.png');
        this.load.image('op_BLUE_symbol', 'assets/icons/colorsymbols/OP_BLUE.png');
        this.load.image('op_PURPLE_symbol', 'assets/icons/colorsymbols/OP_PURPLE.png');
        this.load.image('op_BLACK_symbol', 'assets/icons/colorsymbols/OP_BLACK.png');
        this.load.image('op_YELLOW_symbol', 'assets/icons/colorsymbols/OP_YELLOW.png');

        this.load.image('op_font_RED', 'assets/icons/colorsymbols/OP_FONT_RED.png');
        this.load.image('op_font_GREEN', 'assets/icons/colorsymbols/OP_FONT_GREEN.png');
        this.load.image('op_font_BLUE', 'assets/icons/colorsymbols/OP_FONT_BLUE.png');
        this.load.image('op_font_PURPLE', 'assets/icons/colorsymbols/OP_FONT_PURPLE.png');
        this.load.image('op_font_BLACK', 'assets/icons/colorsymbols/OP_FONT_BLACK.png');
        this.load.image('op_font_YELLOW', 'assets/icons/colorsymbols/OP_FONT_YELLOW.png');

        this.load.image('op_cost_BLACK_0', 'assets/icons/costicons/BLACK_0.png');
        this.load.image('op_cost_BLACK_1', 'assets/icons/costicons/BLACK_1.png');
        this.load.image('op_cost_BLACK_2', 'assets/icons/costicons/BLACK_2.png');
        this.load.image('op_cost_BLACK_3', 'assets/icons/costicons/BLACK_3.png');
        this.load.image('op_cost_BLACK_4', 'assets/icons/costicons/BLACK_4.png');
        this.load.image('op_cost_BLACK_5', 'assets/icons/costicons/BLACK_5.png');
        this.load.image('op_cost_BLACK_6', 'assets/icons/costicons/BLACK_6.png');
        this.load.image('op_cost_BLACK_8', 'assets/icons/costicons/BLACK_8.png');
        this.load.image('op_cost_BLUE_0', 'assets/icons/costicons/BLUE_0.png');
        this.load.image('op_cost_BLUE_1', 'assets/icons/costicons/BLUE_1.png');
        this.load.image('op_cost_BLUE_2', 'assets/icons/costicons/BLUE_2.png');
        this.load.image('op_cost_BLUE_3', 'assets/icons/costicons/BLUE_3.png');
        this.load.image('op_cost_BLUE_4', 'assets/icons/costicons/BLUE_4.png');
        this.load.image('op_cost_BLUE_5', 'assets/icons/costicons/BLUE_5.png');
        this.load.image('op_cost_BLUE_6', 'assets/icons/costicons/BLUE_6.png');
        this.load.image('op_cost_BLUE_7', 'assets/icons/costicons/BLUE_7.png');
        this.load.image('op_cost_BLUE_9', 'assets/icons/costicons/BLUE_9.png');
        this.load.image('op_cost_GREEN_1', 'assets/icons/costicons/GREEN_1.png');
        this.load.image('op_cost_GREEN_2', 'assets/icons/costicons/GREEN_2.png');
        this.load.image('op_cost_GREEN_3', 'assets/icons/costicons/GREEN_3.png');
        this.load.image('op_cost_GREEN_4', 'assets/icons/costicons/GREEN_4.png');
        this.load.image('op_cost_GREEN_5', 'assets/icons/costicons/GREEN_5.png');
        this.load.image('op_cost_GREEN_6', 'assets/icons/costicons/GREEN_6.png');
        this.load.image('op_cost_GREEN_7', 'assets/icons/costicons/GREEN_7.png');
        this.load.image('op_cost_GREEN_8', 'assets/icons/costicons/GREEN_8.png');
        this.load.image('op_cost_PURPLE_0', 'assets/icons/costicons/PURPLE_0.png');
        this.load.image('op_cost_PURPLE_1', 'assets/icons/costicons/PURPLE_1.png');
        this.load.image('op_cost_PURPLE_2', 'assets/icons/costicons/PURPLE_2.png');
        this.load.image('op_cost_PURPLE_3', 'assets/icons/costicons/PURPLE_3.png');
        this.load.image('op_cost_PURPLE_4', 'assets/icons/costicons/PURPLE_4.png');
        this.load.image('op_cost_PURPLE_5', 'assets/icons/costicons/PURPLE_5.png');
        this.load.image('op_cost_PURPLE_6', 'assets/icons/costicons/PURPLE_6.png');
        this.load.image('op_cost_PURPLE_7', 'assets/icons/costicons/PURPLE_7.png');
        this.load.image('op_cost_PURPLE_8', 'assets/icons/costicons/PURPLE_8.png');
        this.load.image('op_cost_PURPLE_10', 'assets/icons/costicons/PURPLE_10.png');
        this.load.image('op_cost_RED_1', 'assets/icons/costicons/RED_1.png');
        this.load.image('op_cost_RED_2', 'assets/icons/costicons/RED_2.png');
        this.load.image('op_cost_RED_3', 'assets/icons/costicons/RED_3.png');
        this.load.image('op_cost_RED_4', 'assets/icons/costicons/RED_4.png');
        this.load.image('op_cost_RED_5', 'assets/icons/costicons/RED_5.png');
        this.load.image('op_cost_RED_6', 'assets/icons/costicons/RED_6.png');
        this.load.image('op_cost_RED_7', 'assets/icons/costicons/RED_7.png');
        this.load.image('op_cost_RED_9', 'assets/icons/costicons/RED_9.png');
        this.load.image('op_cost_YELLOW_1', 'assets/icons/costicons/YELLOW_1.png');
        this.load.image('op_cost_YELLOW_2', 'assets/icons/costicons/YELLOW_2.png');
        this.load.image('op_cost_YELLOW_3', 'assets/icons/costicons/YELLOW_3.png');
        this.load.image('op_cost_YELLOW_4', 'assets/icons/costicons/YELLOW_4.png');
        this.load.image('op_cost_YELLOW_5', 'assets/icons/costicons/YELLOW_5.png');
        this.load.image('op_cost_YELLOW_9', 'assets/icons/costicons/YELLOW_8.png');
        this.load.image('op_cost_YELLOW_10', 'assets/icons/costicons/YELLOW_10.png');

        this.load.image('op_leader_BLACK', 'assets/icons/leadercolorsymbols/LEADER_BLACK.png');
        this.load.image('op_leader_BLACK_YELLOW', 'assets/icons/leadercolorsymbols/LEADER_BLACK_YELLOW.png');
        this.load.image('op_leader_BLUE_PURPLE', 'assets/icons/leadercolorsymbols/LEADER_BLUE_PURPLE.png');
        this.load.image('op_leader_BLUE', 'assets/icons/leadercolorsymbols/LEADER_BLUE.png');
        this.load.image('op_leader_GREEN_BLUE', 'assets/icons/leadercolorsymbols/LEADER_GREEN_BLUE.png');
        this.load.image('op_leader_GREEN_YELLOW', 'assets/icons/leadercolorsymbols/LEADER_GREEN_YELLOW.png');
        this.load.image('op_leader_GREEN', 'assets/icons/leadercolorsymbols/LEADER_GREEN.png');
        this.load.image('op_leader_PURPLE_BLACK', 'assets/icons/leadercolorsymbols/LEADER_PURPLE_BLACK.png');
        this.load.image('op_leader_PURPLE', 'assets/icons/leadercolorsymbols/LEADER_PURPLE.png');
        this.load.image('op_leader_RED_BLACK', 'assets/icons/leadercolorsymbols/LEADER_RED_BLACK.png');
        this.load.image('op_leader_RED_GREEN', 'assets/icons/leadercolorsymbols/LEADER_RED_GREEN.png');
        this.load.image('op_leader_RED', 'assets/icons/leadercolorsymbols/LEADER_RED.png');
        this.load.image('op_leader_YELLOW', 'assets/icons/leadercolorsymbols/LEADER_YELLOW.png');

        this.load.image('op_leader_OP01-001', 'assets/icons/leaderportraits/rleaderart_OP01-001.png');
        this.load.image('op_leader_OP01-002', 'assets/icons/leaderportraits/rleaderart_OP01-002.png');
        this.load.image('op_leader_OP01-003', 'assets/icons/leaderportraits/rleaderart_OP01-003.png');
        this.load.image('op_leader_OP01-031', 'assets/icons/leaderportraits/rleaderart_OP01-031.png');
        this.load.image('op_leader_OP01-060', 'assets/icons/leaderportraits/rleaderart_OP01-060.png');
        this.load.image('op_leader_OP01-061', 'assets/icons/leaderportraits/rleaderart_OP01-061.png');
        this.load.image('op_leader_OP01-062', 'assets/icons/leaderportraits/rleaderart_OP01-062.png');
        this.load.image('op_leader_OP01-091', 'assets/icons/leaderportraits/rleaderart_OP01-091.png');
        this.load.image('op_leader_OP02-001', 'assets/icons/leaderportraits/rleaderart_OP02-001.png');
        this.load.image('op_leader_OP02-002', 'assets/icons/leaderportraits/rleaderart_OP02-002.png');
        this.load.image('op_leader_OP02-025', 'assets/icons/leaderportraits/rleaderart_OP02-025.png');
        this.load.image('op_leader_OP02-026', 'assets/icons/leaderportraits/rleaderart_OP02-026.png');
        this.load.image('op_leader_OP02-049', 'assets/icons/leaderportraits/rleaderart_OP02-049.png');
        this.load.image('op_leader_OP02-071', 'assets/icons/leaderportraits/rleaderart_OP02-071.png');
        this.load.image('op_leader_OP02-072', 'assets/icons/leaderportraits/rleaderart_OP02-072.png');
        this.load.image('op_leader_OP02-093', 'assets/icons/leaderportraits/rleaderart_OP02-093.png');
        this.load.image('op_leader_OP03-001', 'assets/icons/leaderportraits/rleaderart_OP03-001.png');
        this.load.image('op_leader_OP03-021', 'assets/icons/leaderportraits/rleaderart_OP03-021.png');
        this.load.image('op_leader_OP03-022', 'assets/icons/leaderportraits/rleaderart_OP03-022.png');
        this.load.image('op_leader_OP03-040', 'assets/icons/leaderportraits/rleaderart_OP03-040.png');
        this.load.image('op_leader_OP03-058', 'assets/icons/leaderportraits/rleaderart_OP03-058.png');
        this.load.image('op_leader_OP03-076', 'assets/icons/leaderportraits/rleaderart_OP03-076.png');
        this.load.image('op_leader_OP03-077', 'assets/icons/leaderportraits/rleaderart_OP03-077.png');
        this.load.image('op_leader_OP03-099', 'assets/icons/leaderportraits/rleaderart_OP03-099.png');

        this.load.image('op_attribute_RANGED', 'assets/icons/attributesymbols/RANGED.png');
        this.load.image('op_attribute_SLASH', 'assets/icons/attributesymbols/SLASH.png');
        this.load.image('op_attribute_SPECIAL', 'assets/icons/attributesymbols/SPECIAL.png');
        this.load.image('op_attribute_STRIKE', 'assets/icons/attributesymbols/STRIKE.png');
        this.load.image('op_attribute_WISDOM', 'assets/icons/attributesymbols/WISDOM.png');

        this.load.image('luffy_intro', 'assets/images/luffy_intro.png');
        this.load.image('starter_message', 'assets/images/starter_message.png');
        this.load.image('description_ST01', 'assets/images/description_ST01.png');
        this.load.image('description_ST02', 'assets/images/description_ST02.png');
        this.load.image('description_ST03', 'assets/images/description_ST03.png');
        this.load.image('description_ST04', 'assets/images/description_ST04.png');
        
        this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI'); //plugins
        //this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexroundrectangleplugin.min.js', 'rexRoundRectangle', 'rexRoundRectangle');
        this.load.plugin('rexroundrectanglecanvasplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexroundrectanglecanvasplugin.min.js', 'rexRoundRectangleCanvas', 'rexRoundRectangleCanvas');
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        let welcomeText = this.make.text({
            x : screenCenterX,
            y : screenCenterY+50,
            text: "Welcome to One Piece",
            style: {
                fontFamily: 'Brandon',
                font: "24px monospace",
                fill: "#E9E6CE"
            }
        });
        welcomeText.setOrigin(0.5, 0.5);

        this.time.addEvent({
            delay: 10,
            loop: false,
            callback: () => {
                this.scene.start('login');
            }
        })
    }
}