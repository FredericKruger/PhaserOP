class PackOpeningScene extends Phaser.Scene {

    constructor() {
        super({key: SCENE_ENUMS.PACK_OPENING});
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1); //add background image

        // Create pack list panel
        let padding = 25;
        let packPanelSize = {width: 250, height: this.cameras.main.height-padding*2};
        let packPanelOutline = this.add.rexRoundRectangleCanvas(packPanelSize.width/2 + padding, screenCenterY, packPanelSize.width, packPanelSize.height, 5, COLOR_ENUMS.OP_CREAM, COLOR_ENUMS.OP_CREAM_DARKER, 2);

        // Create a texture from the image
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, packPanelSize.width, packPanelSize.height);
        graphics.generateTexture('panelTexture', packPanelSize.width, packPanelSize.height);
        graphics.destroy();

        // Use the texture to fill the rectangle
        let panelBackground = this.add.image(packPanelSize.width/2 + padding, screenCenterY, 'panelTexture');
        panelBackground.setTexture(ASSET_ENUMS.LEATHER_BACKGROUND);
        panelBackground.setDisplaySize(packPanelSize.width, packPanelSize.height);
        panelBackground.setDepth(-1); // Ensure the background is behind the outline
        

        // Create Opening Zone
        let openingZoneSize = {width: this.cameras.main.width - packPanelSize.width - padding*3, height: this.cameras.main.height-padding*2};
        let openingZoneOutline = this.add.rexRoundRectangleCanvas(this.cameras.main.width  - padding - openingZoneSize.width/2, screenCenterY, openingZoneSize.width, openingZoneSize.height, 5, COLOR_ENUMS.OP_CREAM, COLOR_ENUMS.OP_CREAM_DARKER, 2);
        let openingZoneTitle = new Button({
            scene: this,
            x: openingZoneOutline.x, 
            y: openingZoneOutline.y - openingZoneSize.height/2 + 10,
            width: 150,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Open Packs",
            fontsize: 25,
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        });

        // Create store button


        // Create back button
        let backButton = new Button({
            scene: this,
            x: this.cameras.main.width - padding - 40, 
            y: this.cameras.main.height - padding - 15,
            width: 100,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Back",
            fontsize: 18,
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        });
        backButton.setInteractive(true);
        backButton.on('pointerover',  () => {backButton.setScale(1.1)});
        backButton.on('pointerout',  () => {backButton.setScale(1)});
    }

}