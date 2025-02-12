class DeckSelectionScene extends Phaser.Scene {
 
        constructor() {
            super({ key: SCENE_ENUMS.DECK_SELECTION });

            this.vsAI = false;
        }

        init(data) {
            this.vsAI = data.vsAI;
        }

        create() {
            this.screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
            this.screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

            this.decksPanelSize = {
                width: this.cameras.main.width*0.65,
                height: this.cameras.main.height*0.85,
                x: this.screenCenterX*0.8,
                y: this.screenCenterY
            }

            this.add.image(this.screenCenterX, this.screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1); //add background image

            //Create the Deck Panel
            this.createDecksPanel();

            //Create Deck selection Grid
            this.playerDeckSelectionPanel = new DeckSelectionPanel(
                this,
                {
                    decklist: this.game.gameClient.decklist,
                    x: this.decksPanelSize.x,
                    y: this.decksPanelSize.y,
                    width: this.decksPanelSize.width,
                    height: this.decksPanelSize.height,
                    panelTitle: "Select your Deck",
                    player: true
                }
            );
            
            //Add title
            this.add.image(this.decksPanelSize.x, this.decksPanelSize.y - this.decksPanelSize.height/2, ASSET_ENUMS.IMAGE_DECK_SELECTION_TITLE).setScale(0.2);

            //Add the collection button
            this.openCollectionButton = this.add.image(this.decksPanelSize.x, this.decksPanelSize.y + this.decksPanelSize.height/2, ASSET_ENUMS.ICON_COLLECTION).setScale(0.25);
            let openCollectionButtonBrightness = this.openCollectionButton.preFX.addColorMatrix().brightness(1.5);
            openCollectionButtonBrightness.active = false;
            this.openCollectionButton.setInteractive();
            this.openCollectionButton.on('pointerover', () => {
                this.tweens.killTweensOf(openCollectionButtonBrightness);
                this.add.tween({
                    targets: openCollectionButtonBrightness,
                    alpha: { from: 0, to: 1, yoyo: false, duration: 100, ease: "Expo" },
                    onStart: () => { openCollectionButtonBrightness.active = true; },
                });
            });
            this.openCollectionButton.on('pointerout', () => {
                this.tweens.killTweensOf(openCollectionButtonBrightness);
                this.add.tween({
                    targets: openCollectionButtonBrightness,
                    alpha: { from: 1, to: 0, yoyo: false, duration: 100, ease: "Expo" },
                    onComplete: () => { openCollectionButtonBrightness.active = false; },
                });    
            });
            this.openCollectionButton.on('pointerdown', () => {
                this.scene.start(SCENE_ENUMS.COLLECTION_MANAGER);
            }); 
        }

        createDecksPanel() {
            //this.add.image(this.decksPanelSize.x, this.decksPanelSize.y, ASSET_ENUMS.DECK_SELECTION_BACKGROUND);
            
            // Create a texture from the image
            let graphics = this.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, this.decksPanelSize.width, this.decksPanelSize.height);
            graphics.generateTexture('decksPanelTexture', this.decksPanelSize.width, this.decksPanelSize.height);
            graphics.destroy();

            // Use the texture to fill the rectangle
            let deckPanelBackground = this.add.image(this.decksPanelSize.x, this.decksPanelSize.y, 'decksPanelTexture');
            deckPanelBackground.setTexture(ASSET_ENUMS.DECK_SELECTION_BACKGROUND);
            deckPanelBackground.setDisplaySize(this.decksPanelSize.width, this.decksPanelSize.height);

            // Create a mask with rounded corners
            let maskGraphics = this.make.graphics();
            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillRoundedRect(0, 0, this.decksPanelSize.width, this.decksPanelSize.height, 5); // Adjust the radius as needed
            maskGraphics.generateTexture('decksPanelMask', this.decksPanelSize.width, this.decksPanelSize.height);
            maskGraphics.destroy();

            let deckPanelMaskedBackground = this.add.image(this.decksPanelSize.x, this.decksPanelSize.y, 'decksPanelMask');
            deckPanelBackground.setMask(deckPanelMaskedBackground.createBitmapMask());
            deckPanelMaskedBackground.setVisible(false); // Hide the mask image

            //create outline
            let deckPanelOutlineGraphics = this.add.graphics();
            deckPanelOutlineGraphics.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER); // Set the line style (width and color)
            deckPanelOutlineGraphics.strokeRoundedRect(
                this.decksPanelSize.x - this.decksPanelSize.width / 2,
                this.decksPanelSize.y - this.decksPanelSize.height / 2,
                this.decksPanelSize.width,
                this.decksPanelSize.height,
                5 // Adjust the radius as needed
            );
        }

}