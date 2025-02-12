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
                x: this.screenCenterX*0.72,
                y: this.screenCenterY
            }

            this.matchSummaryPanelSize = {
                width: this.cameras.main.width*0.25,
                height: this.cameras.main.height*0.85,
                x: this.screenCenterX*1.68,
                y: this.screenCenterY
            }

            this.add.image(this.screenCenterX, this.screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1); //add background image

            //Create the Deck Panel
            this.createDecksPanel();
            //Create Match Summary Panel
            this.createMatchSummaryPanel();

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

            //Create Match Summary Panel
            this.matchSummaryPanel = new MatchSummaryPanel(
                this, 
                {
                    x: this.matchSummaryPanelSize.x,
                    y: this.matchSummaryPanelSize.y,
                    height: this.matchSummaryPanelSize.height,
                    width: this.matchSummaryPanelSize.width
                }
            );
            
            //Add title
            this.add.image(this.decksPanelSize.x, this.decksPanelSize.y - this.decksPanelSize.height/2, ASSET_ENUMS.IMAGE_DECK_SELECTION_TITLE).setScale(0.2);

            //Add the collection button
            this.openCollectionButton = this.add.image(this.decksPanelSize.x, this.decksPanelSize.y + this.decksPanelSize.height/2, ASSET_ENUMS.ICON_COLLECTION).setScale(0.25);
            let openCollectionButtonBrightness = this.openCollectionButton.preFX.addColorMatrix().brightness(1.2);
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

            //Add play button
            this.playButton = this.add.image(this.matchSummaryPanelSize.x, this.matchSummaryPanelSize.y + this.matchSummaryPanelSize.height/2 - 50, ASSET_ENUMS.ICON_PLAY).setScale(0.25);
            this.playButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 5);
            let playButtonBrightness = this.playButton.preFX.addColorMatrix().brightness(1.2);
            playButtonBrightness.active = false;
            this.playButton.setInteractive();
            this.playButton.on('pointerover', () => {
                this.tweens.killTweensOf(playButtonBrightness);
                this.add.tween({
                    targets: playButtonBrightness,
                    alpha: { from: 0, to: 1, yoyo: false, duration: 100, ease: "Expo" },
                    onStart: () => { playButtonBrightness.active = true; },
                });
            });
            this.playButton.on('pointerout', () => {
                this.tweens.killTweensOf(playButtonBrightness);
                this.add.tween({
                    targets: playButtonBrightness,
                    alpha: { from: 1, to: 0, yoyo: false, duration: 100, ease: "Expo" },
                    onComplete: () => { playButtonBrightness.active = false; },
                }); 
            });
            //this.playButton.on('pointerdown', () => this.startDuel());

            // Create back button
            this.backButton = new Button({
                scene: this,
                x: this.cameras.main.width - 70,
                y: this.cameras.main.height - 70,
                width: 70,
                height: 40,    
                radius: 5,
                backgroundcolor: COLOR_ENUMS.OP_CREAM,
                outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
                text: "Back",
                fontsize: 25,
                fontfamily: "OnePieceFont",
                textColor: COLOR_ENUMS_CSS.OP_BLACK,
            });
            this.backButton.setInteractive(true);
            this.backButton.on('pointerover',  () => {this.backButton.setScale(1.1)});
            this.backButton.on('pointerout',  () => {this.backButton.setScale(1)});
            this.backButton.on('pointerdown', () => {this.scene.start(SCENE_ENUMS.TITLE)});

        }

        /** Function to create the match summary panel */
        createDecksPanel() {
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

        createMatchSummaryPanel() {
            // Create a texture from the image
            let graphics = this.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, this.matchSummaryPanelSize.width, this.matchSummaryPanelSize.height);
            graphics.generateTexture('maskSummaryPanelTexture', this.matchSummaryPanelSize.width, this.matchSummaryPanelSize.height);
            graphics.destroy();

            // Use the texture to fill the rectangle
            let deckPanelBackground = this.add.image(this.matchSummaryPanelSize.x, this.matchSummaryPanelSize.y, 'maskSummaryPanelTexture');
            deckPanelBackground.setTexture(ASSET_ENUMS.MATCH_READY_BACKGROUND).setScale(1);
            deckPanelBackground.setDisplaySize(this.matchSummaryPanelSize.width, this.matchSummaryPanelSize.height);

            // Apply the crop to the deckPanelBackground from the center top
            /*let cropWidth = this.matchSummaryPanelSize.width;
            let cropHeight = this.matchSummaryPanelSize.height;
            let cropX = (deckPanelBackground.width - cropWidth);
            let cropY = 0;
            deckPanelBackground.setCrop(cropX, cropY, cropWidth, cropHeight);
            deckPanelBackground.setPosition(
                this.matchSummaryPanelSize.x-((deckPanelBackground.width - cropWidth)-cropX)/2, 
                this.matchSummaryPanelSize.y+((deckPanelBackground.height - cropHeight)-cropY)/2).setOrigin(0.5);
            deckPanelBackground.setDisplaySize(this.matchSummaryPanelSize.width, this.matchSummaryPanelSize.height);*/

            // Create a mask with rounded corners
            let maskGraphics = this.make.graphics();
            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillRoundedRect(0, 0, this.matchSummaryPanelSize.width, this.matchSummaryPanelSize.height, 5); // Adjust the radius as needed
            maskGraphics.generateTexture('matchSummaryPanelMask', this.matchSummaryPanelSize.width, this.matchSummaryPanelSize.height);
            maskGraphics.destroy();

            let deckPanelMaskedBackground = this.add.image(this.matchSummaryPanelSize.x, this.matchSummaryPanelSize.y, 'matchSummaryPanelMask');
            deckPanelBackground.setMask(deckPanelMaskedBackground.createBitmapMask());
            deckPanelMaskedBackground.setVisible(false); // Hide the mask image

            //create outline
            let deckPanelOutlineGraphics = this.add.graphics();
            deckPanelOutlineGraphics.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER); // Set the line style (width and color)
            deckPanelOutlineGraphics.strokeRoundedRect(
                this.matchSummaryPanelSize.x - this.matchSummaryPanelSize.width / 2,
                this.matchSummaryPanelSize.y - this.matchSummaryPanelSize.height / 2,
                this.matchSummaryPanelSize.width,
                this.matchSummaryPanelSize.height,
                5 // Adjust the radius as needed
            );
        }

        /** Update the deck summary panel */
        updateSelectedDeck(deck) {
            this.matchSummaryPanel.updateSelectedDeck(deck);
        }

}