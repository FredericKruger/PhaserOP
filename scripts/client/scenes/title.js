class Title extends Phaser.Scene {

     constructor() {
        super({key: 'title'});

        this.deckbuilderLoaded = false;
        this.deckselectionLoaded = false;
        this.game = null;
        this.CardIndex = null;
    }

    init () {
        GameClient.askPlayerDeckList();
    }

    preload () {
        this.load.image(GameClient.playerSettings.avatar, 'assets/icons/playericons/' + GameClient.playerSettings.avatar + '.png');
    }

    create () {
        this.CardIndex = this.cache.json.get('card_data');

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.avatarPortraitWidth = 150/2;

        this.add.image(screenCenterX, screenCenterY, 'background').setScale(1);
        this.add.image(screenCenterX, screenCenterY-320, 'logo').setOrigin(0.5, 0.5).setScale(1);

        this.add.text(30 + this.avatarPortraitWidth, this.avatarPortraitWidth/2, "Welcome, " + GameClient.username, {
            fontFamily: 'Brandon',
            font: "16px monospace",
            fill: "#E9E6CE"
        });

        let bFM = new Button({
            scene: this,
            x: screenCenterX,
            y: screenCenterY+225,
            width: 300,
            height: 50,
            radius: 10,
            backgroundcolor: OP_RED,
            outlinecolor: OP_CREAM,
            text: "RANDOM MATCH",
            fontsize: 32
        });
        bFM.on('pointerdown', () => {this.startDeckSelection(false);});
        bFM.on('pointerout', () => bFM.setScale(1));
        bFM.on('pointerover', () => bFM.setScale(1.1));

        let bVSAI = new Button({
            scene: this,
            x: screenCenterX,
            y: screenCenterY+295,
            width: 300,
            height: 50,
            radius: 10,
            backgroundcolor: OP_BLUE,
            outlinecolor: OP_CREAM,
            text: "VS AI",
            fontsize: 32
        });
        bVSAI.on('pointerdown', () => {this.startDeckSelection(true);});
        bVSAI.on('pointerout', () => bVSAI.setScale(1));
        bVSAI.on('pointerover', () => bVSAI.setScale(1.1));

        let bDB = new Button({
            scene: this,
            x: screenCenterX,
            y: screenCenterY+365,
            width: 300,
            height: 50,
            radius: 10,
            backgroundcolor: OP_ORANGE,
            outlinecolor: OP_CREAM,
            text: "Collection",
            fontsize: 32
        });
        bDB.on('pointerdown', this.startDeckBuilder, this);
        bDB.on('pointerout', () => bDB.setScale(1));
        bDB.on('pointerover', () => bDB.setScale(1.1));

        let logOutB = new Button({
            scene: this,
            x: this.cameras.main.width - 50,
            y: 50,
            width: 30,
            height: 30,
            backgroundcolor: OP_BLACK,
            outlinecolor: OP_CREAM,
            text: "Logout",
            fontsize: 10,
            round : true
        });
        logOutB.on('pointerdown', this.logout, this);
        logOutB.on('pointerout', () => logOutB.setScale(1));
        logOutB.on('pointerover', () => logOutB.setScale(1.1));

        let avatarX = 20 + this.avatarPortraitWidth/2;
        let avatarY = 20 + this.avatarPortraitWidth/2;
        this.add.circle(avatarX, avatarY, this.avatarPortraitWidth/2+1, OP_WHITE, 1).setStrokeStyle(3, OP_CREAM).setOrigin(0.5);
        this.playerAvatar = this.add.image(avatarX, avatarY, GameClient.playerSettings.avatar).setOrigin(0.5).setScale(0.5);

        this.playerAvatar.setInteractive();
        this.playerAvatar.on('pointerover', () => this.playerAvatar.setScale(0.54));
        this.playerAvatar.on('pointerout', () => this.playerAvatar.setScale(0.5));
        this.playerAvatar.on('pointerdown', this.showAvatarSelectionPanel, this);

        this.createAvatarSelectionPanel();

        GameClient.titleScene = this;
    }


    startDeckBuilder () {
        let status = this.scene.manager.scenes[3].sys.getStatus();
        if(status === 7 || status ===  6) {
            this.scene.switch('collectionmanager');
        } else {
            this.scene.start('collectionmanager', {"CardIndex": this.cache.json.get('card_data')});
        }
    }

    /*startDeckSelection (vsAI) {
        if(!this.deckselectionLoaded) {
            this.scene.start('deckselection', {"vsAI": vsAI});
            this.deckselectionLoaded = true;
        } else {
            this.scene.manager.getScene('deckselection').scene.restart({"vsAI": vsAI});
        }
    }*/

    logout () {
        GameClient.playerDisconnect();
    }

    loadLoginScreen() {
        this.scene.switch('login');
    }

    createAvatarSelectionPanel() {
        this.avatarSelectionPanelX = this.playerAvatar.x  - this.playerAvatar.width/2*this.playerAvatar.scale;
        this.avatarSelectionPanelY = this.playerAvatar.y + this.playerAvatar.height*this.playerAvatar.scale;
        this.scrollContainer = this.add.container(this.avatarSelectionPanelX,this.avatarSelectionPanelY);

        //Create the maskshape
        this.maskShape = this.add.graphics();
        this.maskShape.fillRect(this.scrollContainer.x, this.scrollContainer.y, 400, 300);

        //Get the icon data
        let iconData = this.cache.json.get('icon_data');
        let separatorSize = this.avatarPortraitWidth*2*0.4+10; //create standard image separator size

        //Load all thge images if they haven't been loaded yet
        let loader = new Phaser.Loader.LoaderPlugin(this); //create a loader 
        for(let i = 0; i<iconData.length; i++) {
            if(!this.textures.exists(iconData[i])) loader.image(iconData[i], 'assets/icons/playericons/' + iconData[i] + '.png'); //load image
        }

        //Once all the images where loaded
        let iconList = [];
        loader.once(Phaser.Loader.Events.COMPLETE, () => {
            let containerBounds = new Phaser.Geom.Rectangle(this.avatarSelectionPanelX,this.avatarSelectionPanelY, 400, 300); //create container bounds for image handling

            for(let i = 0; i<iconData.length; i++) {
                let image = this.add.image(25 + i%5*separatorSize, 10 + Math.floor(i/5)*separatorSize, iconData[i]).setOrigin(0, 0).setScale(0.8);
                iconList[i] = image;
                image.setInteractive();

                //Event for when an image is selected
                image.on('pointerdown', (pointer) => {
                    let pointerInMask = Phaser.Geom.Rectangle.Contains(containerBounds, pointer.x, pointer.y);
                    if(pointerInMask) { //Only react is pointer is in the container
                        GameClient.playerSettings.avatar = image.texture.key;
                        this.playerAvatar.setTexture(image.texture.key);
                        GameClient.updatePlayerSettings();
                    }
                });
                this.scrollContainer.add(image);
            }
            this.maxContainerHeight = 10 + (Math.floor(iconData.length/5)-3)*separatorSize;

            this.scrollContainer.setVisible(false);

            //add a backgorund to the container
            this.containerBackground = this.add.graphics();
            this.children.moveBelow(this.scrollContainer, this.containerBackground);
            this.updateScrollpanelBackground();

            //Set mask to the container
            this.scrollContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.maskShape));

            //Adding interactivity to the shape
            this.maskShape.setInteractive(new Phaser.Geom.Rectangle(this.scrollContainer.x, this.scrollContainer.y, 400, 300), Phaser.Geom.Rectangle.Contains);
            this.input.on('wheel', (pointer, gameObject, deltaX, deltaY) => {
                if(this.scrollContainer.visible) {
                    this.scrollContainer.y += deltaY/3;
                    this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y, this.avatarSelectionPanelY-this.maxContainerHeight, this.avatarSelectionPanelY);
                }
            });

            this.maskShape.scaleY = 1;
        });
        loader.start();
    }

    updateContentPosition() {
        let scrollPercent = (this.scrollbar.y)  / (300 - 100 - 5 - 5);
        this.scrollContainer.y = this.avatarSelectionPanelY - scrollPercent * this.maxContainerHeight;
    }

    updateScrollpanelBackground() {
        this.containerBackground.clear();
        if(this.scrollContainer.visible) {
            this.containerBackground.fillStyle(OP_WHITE, 1);
            this.containerBackground.fillRect(this.scrollContainer.x, this.scrollContainer.y, 400, 300);
            this.containerBackground.lineStyle(5, OP_CREAM);
            this.containerBackground.strokeRect(this.scrollContainer.x, this.scrollContainer.y, 400, 300);
        }
        this.children.moveBelow( this.containerBackground, this.scrollContainer,);
    }

    showAvatarSelectionPanel() {
        //closing the container
        this.scrollContainer.y = this.avatarSelectionPanelY;
        if(this.scrollContainer.visible) {
            this.scrollContainer.setVisible(false);
            this.updateScrollpanelBackground();
        } else {
            this.scrollContainer.setVisible(true);
            this.updateScrollpanelBackground();
        }
    }

    update () {}

}