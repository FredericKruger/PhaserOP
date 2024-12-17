class LoaderBackground extends Phaser.Scene {
    constructor() {
        super({key: 'loaderbackground'});
    }

    preload(){
        this.load.image('background', 'assets/backgrounds/background.png');
        this.load.image('background2', 'assets/backgrounds/background2.jpg');
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
        
        this.load.image('lorcana_rightarrow', 'assets/elements/lorcana_rightarrow.png');
        this.load.image('lorcana_leftarrow', 'assets/elements/lorcana_leftarrow.png');

        this.load.image('default_avatar', 'assets/icons/playericons/icon1.png');
        this.load.image('ai_avatar', 'assets/icons/playericons/icon1.png');
        
        this.load.image('card_back', 'assets/backart/sleeve-0.png');
        
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