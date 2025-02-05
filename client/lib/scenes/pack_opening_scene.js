class PackOpeningScene extends Phaser.Scene {

    constructor() {
        super({key: SCENE_ENUMS.PACK_OPENING});

        this.padding = 35;

        this.packList = [];
        this.packPlacehoderList = [];

        this.selectedPack = null;

        this.isDragging = false;

        this.animationsProvider = new CardOpeningPanelAnimations(this);
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1); //add background image

        // CREATE PACK LIST PANEL
        this.packPanelSize = {width: 250, height: this.cameras.main.height - this.padding*2};
        this.createPackPanel();
        //this.generatePacks();

        // CREATE OPENING ZONE
        this.openingZoneSize = {width: this.cameras.main.width - this.packPanelSize.width - this.padding*3, height: this.cameras.main.height - this.padding*2};
        this.createOpeningZone();

        // CREATE TITLE
        let openingZoneTitle = this.add.image(
            this.cameras.main.width  - this.padding - this.openingZoneSize.width/2, 
            screenCenterY - this.openingZoneSize.height/2 + 10, ASSET_ENUMS.IMAGE_PACK_OPEN_TITLE).setOrigin(0.5).setScale(0.2);
        
        // Create store button
        this.storeButton = this.add.image(this.packPanelSize.width/2 + this.padding, this.cameras.main.height - this.padding - 60, ASSET_ENUMS.ICON_STORE).setOrigin(0.5).setScale(0.2);
        this.storeButton.setInteractive();
        this.storeButton.on('pointerover',  () => {this.storeButton.setScale(0.21)});
        this.storeButton.on('pointerout',  () => {this.storeButton.setScale(0.2)});

        // Create back button
        let backButton = new Button({
            scene: this,
            x: this.cameras.main.width - this.padding - 40, 
            y: this.cameras.main.height - this.padding - 15,
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
        backButton.on('pointerdown', () => {this.scene.start(SCENE_ENUMS.TITLE)});

        //Create scrollPanel
        this.packScrollPanelSize = {
            width: this.packPanelSize.width, 
            height: this.packPanelSize.height - this.padding - this.storeButton.displayHeight,
            x: this.padding,
            y: this.padding
        };
        this.packScrollPanel = new ScrollPanel(this, this.packScrollPanelSize.x, this.packScrollPanelSize.y, this.packScrollPanelSize.width, this.packScrollPanelSize.height, false);
        this.packScrollPanel.setVisible(true);

        this.generatePacks();

        this.cardPanel = new CardOpeningPanelCardPanel(this);

        //Prepare Drag handlers
        this.input.on('dragstart', (pointer, gameObject) => {
            this.children.bringToTop(gameObject);
            this.isDragging = true;
            gameObject.showBanner(false);

            this.placeholderImage.setPipeline(PIPELINE_ENUMS.GLOWING_BORDER_BLUE_PIPELINE);
            this.circleGraphics.setPipeline(PIPELINE_ENUMS.GLOWING_BORDER_BLUE_PIPELINE);

            this.packScrollPanel.removeElement(gameObject);
            let worldCoord = this.packScrollPanel.convertToWorldPosition(gameObject.x, gameObject.y);
            gameObject.x = worldCoord.x;
            gameObject.y = worldCoord.y;
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            let worldCoord = this.packScrollPanel.convertToWorldPosition(dragX, dragY);
            gameObject.x = worldCoord.x;
            gameObject.y = worldCoord.y;
        });

        this.input.on('dragend', (/** @type {{ upX: any; upY: any; }} */ pointer, /** @type {{ input: { dragStartX: any; dragStartY: any; }; deckCardListContainer: { deckDropZone: { getBounds: () => { (): any; new (): any; contains: { (arg0: any, arg1: any): any; new (): any; }; }; }; removeCardFromDeck: (arg0: any) => any; scrollContainer: { addElement: (arg0: DeckCardEntry) => void; }; }; entryIndex: any; setToLocalPosition: () => void; x: any; y: any; }} */ gameObject, /** @type {any} */ dropped) => {
            if(!dropped) {
                this.packScrollPanel.addElement(gameObject);
                gameObject.setToLocalPosition();
                gameObject.showBanner(true);
                this.isDragging = false;

                this.placeholderImage.resetPipeline();
                this.circleGraphics.resetPipeline();
            }
        });

        this.input.on('drop', (/** @type {any} */ pointer, /** @type {{ x: number; input: { dragStartX: number; dragStartY: number; }; y: number; }} */ gameObject, /** @type {{ getData: (arg0: string) => string; }} */ zone) => {
            if(zone.getData('name') === 'packDropZone'){
                this.isDragging = false;
                this.selectedPack = gameObject;

                //this.placeholderImage.resetPipeline();
                //this.circleGraphics.resetPipeline();

                this.movePackToPlaceholder();
            }
        });
    }

    update(time, delta) {
        if(this.isDragging) {
            this.placeholderImage.pipeline.set1f('time', time / 1000); // Update the time uniform
        }
    }

    createPackPanel() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        // Create a texture from the image
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, this.packPanelSize.width, this.packPanelSize.height);
        graphics.generateTexture('panelTexture', this.packPanelSize.width, this.packPanelSize.height);
        graphics.destroy();

        // Use the texture to fill the rectangle
        let packPanelBackground = this.add.image(this.packPanelSize.width/2 + this.padding, screenCenterY, 'panelTexture');
        packPanelBackground.setTexture(ASSET_ENUMS.LEATHER_BACKGROUND);
        packPanelBackground.setDisplaySize(this.packPanelSize.width, this.packPanelSize.height);
        packPanelBackground.setPipeline(PIPELINE_ENUMS.BLUE_TINT_PIPELINE);

        // Create a mask with rounded corners
        let maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.packPanelSize.width, this.packPanelSize.height, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask', this.packPanelSize.width, this.packPanelSize.height);
        maskGraphics.destroy();

        let packPanelMaskImage = this.add.image(this.packPanelSize.width/2 + this.padding, screenCenterY, 'roundedMask');
        packPanelBackground.setMask(packPanelMaskImage.createBitmapMask());
        packPanelMaskImage.setVisible(false); // Hide the mask image

        //create outline
        let packPanelOutlineGraphics = this.add.graphics();
        packPanelOutlineGraphics.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER); // Set the line style (width and color)
        packPanelOutlineGraphics.strokeRoundedRect(
            packPanelBackground.x - this.packPanelSize.width / 2,
            packPanelBackground.y - this.packPanelSize.height / 2,
            this.packPanelSize.width,
            this.packPanelSize.height,
            5 // Adjust the radius as needed
        );
    }

    createOpeningZone() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        // Create a texture from the image
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, this.openingZoneSize.width, this.openingZoneSize.height);
        graphics.generateTexture('panelTexture2', this.openingZoneSize.width, this.openingZoneSize.height);
        graphics.destroy();

        // Use the texture to fill the rectangle
        let openingZonePanelBackground = this.add.image(this.cameras.main.width  - this.padding - this.openingZoneSize.width/2, screenCenterY, 'panelTexture2');
        openingZonePanelBackground.setTexture(ASSET_ENUMS.MAP_BACKGROUND);
        openingZonePanelBackground.setPipeline(PIPELINE_ENUMS.BLUE_TINT_PIPELINE);

        // Calculate crop area from the center
        let textureWidth = openingZonePanelBackground.width;
        let textureHeight = openingZonePanelBackground.height;
        let cropX = (textureWidth - this.openingZoneSize.width) / 2;
        let cropY = (textureHeight - this.openingZoneSize.height) / 2;
        
        openingZonePanelBackground.setCrop(cropX, cropY, this.openingZoneSize.width, this.openingZoneSize.height); // Crop the texture to fit the panel
        
        // Create a mask with rounded corners
        let maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.openingZoneSize.width, this.openingZoneSize.height, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask2', this.openingZoneSize.width, this.openingZoneSize.height);
        maskGraphics.destroy();

        let openingZonePanelMaskImage = this.add.image(this.cameras.main.width  - this.padding - this.openingZoneSize.width/2, screenCenterY, 'roundedMask2');
        openingZonePanelBackground.setMask(openingZonePanelMaskImage.createBitmapMask());
        openingZonePanelMaskImage.setVisible(false); // Hide the mask image

        //create outline
        let openingZonePanelOutlineGraphics = this.add.graphics();
        openingZonePanelOutlineGraphics.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER); // Set the line style (width and color)
        openingZonePanelOutlineGraphics.strokeRoundedRect(
            openingZonePanelBackground.x - this.openingZoneSize.width / 2,
            openingZonePanelBackground.y - this.openingZoneSize.height / 2,
            this.openingZoneSize.width,
            this.openingZoneSize.height,
            5 // Adjust the radius as needed
        );

        //Create placeholder image
        this.placeholderImage = this.add.image(openingZonePanelBackground.x, openingZonePanelBackground.y, ASSET_ENUMS.IMAGE_PACK_OPEN_PLACEHOLDER).setOrigin(0.5).setScale(0.3).setAlpha(0.4);
        
        maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.placeholderImage.displayWidth-2, this.placeholderImage.displayHeight-2, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask3', this.placeholderImage.displayWidth-2, this.placeholderImage.displayHeight-2);
        maskGraphics.destroy();

        let placeholderMaskImage = this.add.image(openingZonePanelBackground.x, openingZonePanelBackground.y, 'roundedMask3');
        this.placeholderImage.setMask(placeholderMaskImage.createBitmapMask());
        placeholderMaskImage.setVisible(false); // Hide the mask image

        // Create a circle around the placeholder image
        this.circleGraphics = this.add.graphics();
        this.circleGraphics.lineStyle(12, COLOR_ENUMS.OP_ORANGE); // Set the line style (width and color)
        this.circleGraphics.strokeCircle(
            this.placeholderImage.x,
            this.placeholderImage.y,
            this.placeholderImage.displayWidth * 1.08 // Adjust the radius as needed
        );
        this.circleGraphics.setAlpha(0.4);

        //Create Dropzone
        this.dropZone = this.add.zone(
            openingZonePanelBackground.x,
            openingZonePanelBackground.y,
            this.openingZoneSize.width,
            this.openingZoneSize.height,
        ).setRectangleDropZone(this.openingZoneSize.width, this.openingZoneSize.height);
        this.dropZone.setData({ name: 'packDropZone'});    
    }

    generatePacks() {
        this.packList = [];
        this.packPlacehoderList = [];

        let validPackIndex = 0;
        for(let i = 0; i<GameClient.playerSettings.packs.length; i++) {
            let pack = GameClient.playerSettings.packs[i];
            if(pack.amount > 0) {
                let packPlaceholderVisual = new PackVisual(this, 0, 0, pack.set, true, pack.amount, 0.45);
                let packVisual = new PackVisual(this, 0, 0, pack.set, false, pack.amount, 0.45);
                
                let posY = 20 + (packVisual.displayHeight + 10) * validPackIndex + packVisual.displayHeight/2;
                packVisual.updatePosition(this.packScrollPanelSize.width/2, posY);
                packPlaceholderVisual.updatePosition(this.packScrollPanelSize.width/2, posY);

                packVisual.setInteractive();
                this.input.setDraggable(packVisual);

                this.packScrollPanel.addElement(packPlaceholderVisual);
                this.packScrollPanel.addElement(packVisual);

                if(pack.amount < 1) packPlaceholderVisual.setVisible(false);

                this.packList.push(packVisual);
                this.packPlacehoderList.push(packPlaceholderVisual);

                validPackIndex++;
            }
        }
    }

    movePackToPlaceholder() {
        let completeFunction = () => {
            this.openPack([1, 1, 1, 1, 1]);
        };
        
        this.input.enabled = false; // Disable input while animating
        this.animationsProvider.movePackToPlaceHolderAnimation(completeFunction, this.selectedPack, this.placeholderImage);
    }

    openPack(cardList) {
        let completeFunction = (carList) => { 
            this.showPack(carList);
        }
        this.animationsProvider.openPackAnimation(this.selectedPack, completeFunction, cardList);
    }

    showPack(cardList){
        this.cardPanel.resetPanel();
        this.cardPanel.showCards(cardList);
        this.cardPanel.setVisible(true);
    }
}