class TitleScene extends Phaser.Scene {

     constructor() {
        super({key: SCENE_ENUMS.TITLE});
        
        this.deckbuilderLoaded = false;
        this.deckselectionLoaded = false;
        this.CardIndex = null;
    }

    init () {
        this.game.gameClient.titleScene = this;
        this.game.gameClient.askPlayerDeckList();
    }

    preload () {
        let assetPath = 'assets/icons/playericons';
        this.load.image(this.game.gameClient.playerSettings.avatar, `${assetPath}/${this.game.gameClient.playerSettings.avatar}.png`);   
    }

    create () {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.avatarPortraitWidth = 150/2;

        this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1);
        this.add.image(screenCenterX, screenCenterY-320, ASSET_ENUMS.LOGO).setOrigin(0.5, 0.5).setScale(1);

        this.add.text(30 + this.avatarPortraitWidth, this.avatarPortraitWidth/2, "Welcome, " + this.game.gameClient.username, {
            fontFamily: 'Brandon',
            font: "16px monospace",
            color: COLOR_ENUMS_CSS.OP_CREAM
        });

        let bFM = this.add.image(screenCenterX, screenCenterY+225, ASSET_ENUMS.ICON_RANDOM_MATCH).setOrigin(0.5);
        bFM.setScale(0.25);
        bFM.setInteractive();
        //bFM.on('pointerdown', () => {this.startDeckSelection(false);});
        bFM.on('pointerout', () => bFM.setScale(0.25));
        bFM.on('pointerover', () => bFM.setScale(0.26));

        let bVSAI = this.add.image(screenCenterX, screenCenterY+295, ASSET_ENUMS.ICON_VS_AI).setOrigin(0.5);
        bVSAI.setScale(0.25);
        bVSAI.setInteractive();
        //bVSAI.on('pointerdown', () => {this.startDeckSelection(true);});
        bVSAI.on('pointerout', () => bVSAI.setScale(0.25));
        bVSAI.on('pointerover', () => bVSAI.setScale(0.26));

        let bDB = this.add.image(screenCenterX, screenCenterY+365, ASSET_ENUMS.ICON_COLLECTION).setOrigin(0.5);
        bDB.setScale(0.26);
        bDB.setInteractive();
        bDB.on('pointerdown', this.startDeckBuilder, this);
        bDB.on('pointerout', () => bDB.setScale(0.26));
        bDB.on('pointerover', () => bDB.setScale(0.27));

        let logOutB = this.add.image(this.cameras.main.width - 75, 75, ASSET_ENUMS.ICON_LOUGOUT).setOrigin(0.5);
        logOutB.setScale(0.2);
        logOutB.setInteractive();
        logOutB.on('pointerdown', this.logout, this);
        logOutB.on('pointerout', () => logOutB.setScale(0.2));
        logOutB.on('pointerover', () => logOutB.setScale(0.21));

        let shopButton = this.add.image(150, this.cameras.main.height - 75, ASSET_ENUMS.ICON_STORE).setOrigin(0.5);
        shopButton.setScale(0.2);
        shopButton.setInteractive();
        //shopButton.on('pointerdown', this.openStore, this);
        shopButton.on('pointerout', () => shopButton.setScale(0.2));
        shopButton.on('pointerover', () => shopButton.setScale(0.21));

        let openPackButton = this.add.image(this.cameras.main.width - 150, this.cameras.main.height - 120, ASSET_ENUMS.ICON_OPEN_PACK).setOrigin(0.5);
        openPackButton.setScale(0.15);
        openPackButton.setInteractive();
        openPackButton.on('pointerdown', this.openPacks, this);
        openPackButton.on('pointerout', () => openPackButton.setScale(0.15));
        openPackButton.on('pointerover', () => openPackButton.setScale(0.16));

        let avatarX = 20 + this.avatarPortraitWidth/2;
        let avatarY = 20 + this.avatarPortraitWidth/2;
        this.add.circle(avatarX, avatarY, this.avatarPortraitWidth/2+1, COLOR_ENUMS.OP_WHITE, 1).setStrokeStyle(3, COLOR_ENUMS.OP_CREAM).setOrigin(0.5);
        this.playerAvatar = this.add.image(avatarX, avatarY, this.game.gameClient.playerSettings.avatar).setOrigin(0.5).setScale(0.5);

        this.createAvatarSelectionPanel();

        this.playerAvatar.setInteractive();
        this.playerAvatar.on('pointerover', () => this.playerAvatar.setScale(0.54));
        this.playerAvatar.on('pointerout', () => this.playerAvatar.setScale(0.5));
        this.playerAvatar.on('pointerdown', () => {this.scrollContainer.setVisible(!this.scrollContainer.isVisible)});

        this.firstLoginPanel = null;
        if(this.game.gameClient.firstLogin) {
            this.firstLoginPanel = new FirstLoginPanel(this, this.cameras.main.width/2, this.cameras.main.height/2);
            this.firstLoginPanel.launch();
        }
    }

    startDeckBuilder () {
        let status = this.scene.manager.scenes[3].sys.getStatus();
        if(status === 7 || status ===  6) {
            this.scene.switch(SCENE_ENUMS.COLLECTION_MANAGER);
        } else {
            this.scene.start(SCENE_ENUMS.COLLECTION_MANAGER);
        }
    }

    //openPacks
    openPacks () {
        this.scene.start(SCENE_ENUMS.PACK_OPENING);
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
        this.game.gameClient.playerDisconnect();
    }

    loadLoginScreen() {
        this.scene.switch(SCENE_ENUMS.LOGIN);
    }

    createAvatarSelectionPanel() {
        this.avatarSelectionPanelX = this.playerAvatar.x  - this.playerAvatar.width/2*this.playerAvatar.scale;
        this.avatarSelectionPanelY = this.playerAvatar.y + this.playerAvatar.height*this.playerAvatar.scale;
        
        
        //this.scrollContainer = this.add.container(this.avatarSelectionPanelX,this.avatarSelectionPanelY);
        let backgroundConfig = {backgroundColor: COLOR_ENUMS.OP_WHITE, alpha: 1.0, round: 15};
        this.scrollContainer = new ScrollPanel(this, this.avatarSelectionPanelX, this.avatarSelectionPanelY, 325, 250, true, backgroundConfig);

        //Get the icon data
        let iconData = this.cache.json.get(DATA_ENUMS.PLAYER_ICONS);
        
        let separatorSize = this.avatarPortraitWidth*2*0.4+10; //create standard image separator size

        //Load all thge images if they haven't been loaded yet
        let loader = new Phaser.Loader.LoaderPlugin(this); //create a loader 
        for(let i = 0; i<iconData.length; i++) {
            if(!this.textures.exists(iconData[i])) loader.image(iconData[i], `assets/icons/playericons/${iconData[i]}.png`); //load image
        }

        //Once all the images where loaded
        let iconList = [];
        loader.once(Phaser.Loader.Events.COMPLETE, () => {
            for(let i = 0; i<iconData.length; i++) {
                let image = this.add.image(10 + i%4*separatorSize, 10 + Math.floor(i/4)*separatorSize, iconData[i]).setOrigin(0, 0).setScale(0.8);
                iconList[i] = image;
                image.setInteractive();

                //Event for when an image is selected
                image.on('pointerdown', (pointer) => {
                    this.game.gameClient.playerSettings.avatar = image.texture.key;
                        this.playerAvatar.setTexture(image.texture.key);
                        this.game.gameClient.updatePlayerSettings();
                });
                this.scrollContainer.addElement(image);
            }
        });
        loader.start();
    }
}