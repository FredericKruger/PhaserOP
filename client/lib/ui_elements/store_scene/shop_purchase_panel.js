class PurchasePanel extends Phaser.GameObjects.Container {

    constructor(scene, x, y) {
        super(scene, x, y);

        this.obj = [];

        this.scene = scene;
        this.shopItem = null;
        this.itemType = null;

        this.isInAnimation = false;

        // Create a semi-transparent overlay that takes up the whole window
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(COLOR_ENUMS.OP_BLACK, 0.7); // Black color with 50% opacity
        this.overlay.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.overlay);

        this.screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        this.screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
        this.mainPanelSize = {
            width: this.scene.cameras.main.width * 0.5,
            height: this.scene.cameras.main.height * 0.7
        }

        //Creating the main panel
        this.createCentralPanel();

        //Creating the waiting animation
        this.waitingAnimation = this.scene.add.sprite(
            -this.scene.scale.width/2 + 100, 
            this.scene.scale.height/2 - 75, ASSET_ENUMS.SKULL_SPRITESHEET).setScale(0.5).setOrigin(0.5);
        this.waitingAnimation.setVisible(false);
        this.obj.push(this.waitingAnimation);

        //Make buttons interactive
        this.buyButton.setInteractive();
        this.buyButton.on('pointerover', () => {
            if(!this.isInAnimation) {
                this.buyButton.setScale(0.16);
                this.buyButton.preFX.addGlow(COLOR_ENUMS.OP_BLUE, 4 ,0, false, 0.1, 32);
            }
        });
        this.buyButton.on('pointerout', () => {
            if(!this.isInAnimation) {
                this.buyButton.setScale(0.15);
                this.buyButton.preFX.clear();
            }
        });
        this.buyButton.on('pointerdown', () => {
            if(!this.isInAnimation) {
                this.waitingAnimation.setVisible(true);
                this.waitingAnimation.play(ANIMATION_ENUMS.SKULL_WAITING_ANIMATION);

                this.scene.buyItem(this.shopItem, this.itemType);
            }
        });

        this.add(this.obj);
        this.setSize(this.scene.scale.width, this.scene.scale.height);

        this.scene.add.existing(this);

        this.setVisible(false);
        this.setDepth(3);

        this.setInteractive();
        let mainPanelBounds = new Phaser.Geom.Rectangle(this.mainPanelSize.x, this.mainPanelSize.y, this.mainPanelSize.width, this.mainPanelSize.height);
        this.on('pointerover', () => {});
        this.on('pointerdown', (pointer) => {
            if(!this.isInAnimation) {
                if(!Phaser.Geom.Rectangle.Contains(mainPanelBounds, pointer.x, pointer.y)) {
                    this.setVisible(false);
                }
            }
        });
    }

    /** Function that shows the Purchase Panel */
    launch(shopItem, itemType) {
        this.shopItem = shopItem;
        this.itemType = itemType;

        /** Refresh UI elements */
        this.banner.setTexture(`BANNER_${shopItem.name}`);
        this.placholderart.setTexture(`PACK_ART_${shopItem.name}`);
        this.priceText.setText(shopItem.price);
        this.descriptionTitleText.setText(shopItem.name + ' ' + shopItem.description);

        if(itemType === 'PACKS') {
            this.placholderart.setScale(0.4);
            this.descriptionContentTitleText.setText('Contents per Pack:');
            this.descriptionContentText.setText(
                '  - 5 One Piece Cards\n' +
                '  - At least 1 card will be Uncommon or better'
            );
        } else if (itemType === 'DECKS') {
            this.placholderart.setScale(0.5);
            this.descriptionContentTitleText.setText('Contents per Deck:');
            this.descriptionContentText.setText(
                '  - A deck of 50 cards\n' +
                '  - The deck includes a leader card, and 4 Secret Rare cards'
            );
        }

        //Make the panel visible
        this.setVisible(true);
    }

    createCentralPanel() {
        //create main block
        let graphics = this.scene.add.graphics();
        graphics.fillStyle(COLOR_ENUMS.OP_CREAM_DARKER);
        graphics.fillRoundedRect(
            -this.mainPanelSize.width/2, 
            -this.mainPanelSize.height/2- 50, 
            this.mainPanelSize.width, this.mainPanelSize.height,  
            5);
        this.obj.push(graphics);

        //Store the position
        let mainPanelPosition = {
            x: -this.mainPanelSize.width/2,
            y: -this.mainPanelSize.height/2 - 100
        };

        this.mainPanelSize.x = this.screenCenterX-this.mainPanelSize.width/2;
        this.mainPanelSize.y = this.screenCenterY-this.mainPanelSize.height/2 - 100;

        //Add background Picture
        this.backgroundImage = this.scene.add.image(
            0, 
            -150, 
            ASSET_ENUMS.BACKGROUND5
        ).setOrigin(0.5).setAlpha(0.7);
        this.obj.push(this.backgroundImage);

        // Calculate crop area from the center
        let cropX = 50;
        let cropY = 30;             
        this.backgroundImage.setCrop(cropX, cropY, this.backgroundImage.width-100, this.backgroundImage.height-60); // Crop the texture to fit the panel

        //Add outline
        let backgroundImageOutline = this.scene.add.graphics();
        backgroundImageOutline.lineStyle(3, COLOR_ENUMS.OP_GREY); // Set the line style (width and color)
        backgroundImageOutline.strokeRoundedRect(
            this.backgroundImage.x - (this.backgroundImage.width/2-50),
            this.backgroundImage.y - (this.backgroundImage.height/2-30),
            this.backgroundImage.displayWidth-100,
            this.backgroundImage.displayHeight-60,
            0 // Adjust the radius as needed
        );
        this.obj.push(backgroundImageOutline);

        //Create Placeholder for banner
        this.banner = this.scene.add.image(
            0, 
            this.backgroundImage.y - (this.backgroundImage.height/2-30) + 20, 
            ''
        ).setOrigin(0.5).setScale(0.35);
        this.banner.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4 ,0, false, 0.1, 32);
        this.obj.push(this.banner);

        //Create Description Panel
        let descriptionPanel = this.scene.add.graphics();
        descriptionPanel.fillStyle(COLOR_ENUMS.OP_CREAM);
        descriptionPanel.fillRoundedRect(
            -this.backgroundImage.width/2 + 50, 
            this.backgroundImage.y + (this.backgroundImage.height/2-30) + 20,
            (this.backgroundImage.width-100)*0.68, 200,  
            5);
        this.obj.push(descriptionPanel);

        let descriptionPanelOutline = this.scene.add.graphics();
        descriptionPanelOutline.lineStyle(3, COLOR_ENUMS.OP_GREY);
        descriptionPanelOutline.strokeRoundedRect(
            -this.backgroundImage.width/2 + 50, 
            this.backgroundImage.y + (this.backgroundImage.height/2-30) + 20,
            (this.backgroundImage.width-100)*0.68, 200,  
            5);
        this.obj.push(descriptionPanelOutline);

        let descriptionPanelPosition = {
            x: -this.backgroundImage.width/2 + 50,
            y: this.backgroundImage.y + (this.backgroundImage.height/2-30) + 20,
            width: (this.backgroundImage.width-100)*0.68,
            height: 200
        };

        //Add Text
        this.descriptionTitleText = this.scene.add.text(
            descriptionPanelPosition.x + 10,
            descriptionPanelPosition.y + 10,
            '',
            {
                font: "26px OnePieceFont",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }
        );
        this.obj.push(this.descriptionTitleText);

        this.descriptionContentTitleText = this.scene.add.text(
            descriptionPanelPosition.x + 10,
            descriptionPanelPosition.y + 40,
            '',
            {
                font: "22px OnePieceTCGFont",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }
        );
        this.obj.push(this.descriptionContentTitleText);

        this.descriptionContentText = this.scene.add.text(
            descriptionPanelPosition.x + 10,
            descriptionPanelPosition.y + 70,
            '',
            {
                font: "16px OnePieceTCGFont",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }
        );
        this.obj.push(this.descriptionContentText);

        //Create Buy Buton Panel
        let buyButtonPanel = this.scene.add.graphics();
        buyButtonPanel.fillStyle(COLOR_ENUMS.OP_CREAM);
        buyButtonPanel.fillRoundedRect(
            -this.backgroundImage.width/2 + 50 + (this.backgroundImage.width-100)*0.70, 
            this.backgroundImage.y + (this.backgroundImage.height/2-30) + 20,
            (this.backgroundImage.width-100)*0.3, 200,  
            5);
        this.obj.push(buyButtonPanel);

        let buyButtonPanelOutline = this.scene.add.graphics();
        buyButtonPanelOutline.lineStyle(3, COLOR_ENUMS.OP_GREY);
        buyButtonPanelOutline.strokeRoundedRect(
            -this.backgroundImage.width/2 + 50 + (this.backgroundImage.width-100)*0.70, 
            this.backgroundImage.y + (this.backgroundImage.height/2-30) + 20,
            (this.backgroundImage.width-100)*0.3, 200,  
            5);
        this.obj.push(buyButtonPanelOutline);

        let buyButtonPanelPosition = {
            x: -this.backgroundImage.width/2 + 50 + (this.backgroundImage.width-100)*0.70 + (this.backgroundImage.width-100)*0.3/2,
            y: (this.backgroundImage.y + (this.backgroundImage.height/2-30) + 20) + 100,
            width: (this.backgroundImage.width-100)*0.3,
            height: 200
        };

        //Add price Tag
        let pricePlaceHolder = this.scene.add.graphics();
        pricePlaceHolder.fillStyle(COLOR_ENUMS.OP_BLACK);
        pricePlaceHolder.fillRoundedRect(
            buyButtonPanelPosition.x - buyButtonPanelPosition.width/2 + 20, 
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40,
            buyButtonPanelPosition.width-40, 50,  
            5);
        this.obj.push(pricePlaceHolder);

        let pricePlaceHolderOutline = this.scene.add.graphics();
        pricePlaceHolderOutline.lineStyle(3, COLOR_ENUMS.OP_GOLD);
        pricePlaceHolderOutline.strokeRoundedRect(
            buyButtonPanelPosition.x - buyButtonPanelPosition.width/2 + 20, 
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40,
            buyButtonPanelPosition.width-40, 50,  
            5);
        this.obj.push(pricePlaceHolderOutline);

        //Add Text
        let priceIcon = this.scene.add.image(
            buyButtonPanelPosition.x + buyButtonPanelPosition.width/2 - 20 - 20,
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40 + 25,
            ASSET_ENUMS.ICON_BERRIES
        ).setOrigin(0.5).setScale(0.6);
        this.obj.push(priceIcon);

        this.priceText = this.scene.add.text(
            buyButtonPanelPosition.x + buyButtonPanelPosition.width/2 - 20 - 50,
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40 + 25,
            '',
            {
                font: "22px OnePieceTCGFont",
                color: COLOR_ENUMS_CSS.OP_CREAM
            }
        ).setOrigin(1, 0.5);
        this.obj.push(this.priceText);

        //Add Buy Button
        this.buyButton = this.scene.add.image(
            buyButtonPanelPosition.x,
            buyButtonPanelPosition.y + 40,
            ASSET_ENUMS.ICON_BUY
        ).setOrigin(0.5).setScale(0.15);
        this.obj.push(this.buyButton);

        //Add Placeholder pack
        this.placholderart = this.scene.add.image(this.backgroundImage.x, this.backgroundImage.y + 40, '').setScale(0.4);
        this.placholderart.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 4 ,0, false, 0.1, 32);
        this.obj.push(this.placholderart);
    }

    /** Function that set sthe visibility of the panel
     * @param {boolean} visible - The visibility of the panel
     */
    setvisible(visible) {
        for(let o of this.obj) {
            o.setVisible(visible);
        }
    }

    /** Function that handles a failed purchase
     * @param {string} message - The message to display
     */
    purchaseFailed(message) {
        //Make the panel shake
        this.scene.tweens.add({
            targets: this,
            x: this.x - 10,
            yoyo: true,
            repeat: 5,
            duration: 75,
            ease: 'Power3'
        });
    }

    /** Function that handles a successful purchase
     * 
     */
    purchaseSuccessful(shopItem, itemType, cardList) {
        if(itemType === 'PACKS') {
            this.isInAnimation = true;

            //Stop the waiting animation
            this.waitingAnimation.stop();
            this.waitingAnimation.setVisible(false);

            let treasureImage = this.scene.add.image(
                this.scene.cameras.main.width/2 - 100,
                this.scene.cameras.main.height/2 - 100,
                ASSET_ENUMS.IMAGE_TREASURE_CHEST
            ).setOrigin(0.5).setScale(0).setVisible(true);
            this.add(treasureImage);
            //Create an animation to move the pack to a treasure chest
            // Create a tween to scale the image from 0 to its final size
            this.scene.tweens.add({
                targets: treasureImage,
                scale: { from: 0, to: 1 },
                duration: 400,
                ease: 'Back.easeOut'
            });

            //Create a pack for the animation
            let animationPack = this.scene.add.image(
                this.placholderart.x,
                this.placholderart.y,
                `PACK_ART_${shopItem.name}`
            ).setScale(0.4);
            this.add(animationPack);

            // Create an animation to move the pack to the treasure chest
            this.scene.tweens.add({
                targets: animationPack,
                x: treasureImage.x,
                y: treasureImage.y,
                scale: { from: 0.4, to: 0 },
                duration: 1000,
                delay: 600,
                ease: 'Power2',
                onComplete: () => {
                    animationPack.destroy();

                    this.scene.tweens.add({
                        targets: treasureImage,
                        scale: { from: 1, to: 0 },
                        duration: 200,
                        delay: 100,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            treasureImage.destroy();

                            this.scene.time.delayedCall(1000, () => {
                                this.isInAnimation = false;
                                this.buyButton.preFX.clear();
                            });
                        }
                    });
                }
            });

        } else if(itemType === 'DECKS') {
            let delay = 0;
            let textures = [];
            let images = [];

            this.isInAnimation = true;

            //Prepare retrieval of all textures
            cardList.forEach((card, index) => {
                let cardArtKey = this.scene.game.gameClient.playerCollection.cardCollection[card-1].art;
                textures.push({
                    key: cardArtKey,
                    path: `assets/cardart/${cardArtKey}.png`
                });
            });

            //Create a callback after art is loaded to create animations
            let callback = () => {
                //Stop the spinnin animation
                this.waitingAnimation.stop();
                this.waitingAnimation.setVisible(false);

                cardList.forEach((card, index) => {
                    let cardImage = this.scene.add.image(
                        Phaser.Math.Between(-this.backgroundImage.displayWidth / 2, this.backgroundImage.displayWidth / 2),
                        Phaser.Math.Between(-this.backgroundImage.displayHeight / 2, this.backgroundImage.displayHeight / 2),
                        this.scene.game.gameClient.playerCollection.cardCollection[card-1].art
                    ).setScale(0.7).setOrigin(0.5).setVisible(false);
                    this.add(cardImage);
                    images.push(cardImage);
                    cardImage.preFX.addGlow(this.scene.game.utilFunctions.getRarityColor(this.scene.game.gameClient.playerCollection.cardCollection[card-1].rarity), 4 ,0, false, 0.1, 32);


                    //create the appearing animation
                    this.scene.tweens.add({
                        onStart: () => {
                            cardImage.setVisible(true);
                        },
                        targets: cardImage,
                        scale: { from: 0.7, to: 0.25 },
                        duration: 150,
                        delay: delay,
                        ease: 'Bounce.easeOut',
                        onComplete: () => {
                            if(index ===  cardList.length - 1) {
                                // Apply burning shader to all cards
                                this.scene.time.delayedCall(1000, () => {
                                    cardList.forEach((card, i) => {
                                        let cardImage = images[i];
                                        if (cardImage) {
                                            cardImage.setPipeline(PIPELINE_ENUMS.BURNING_PIPELINE);
                                            this.scene.tweens.add({
                                                targets: { burnAmount: 0 },
                                                burnAmount: 1,
                                                duration: 1000,
                                                ease: 'Linear',
                                                onUpdate: (tween) => {
                                                    cardImage.pipeline.set1f('burnAmount', tween.getValue());
                                                },
                                                onComplete: () => {
                                                    cardImage.destroy(); // Destroy the card after the burning effect

                                                    if(i === cardList.length - 1) {
                                                        this.scene.time.delayedCall(1000, () => {
                                                            this.isInAnimation = false;
                                                            this.buyButton.preFX.clear();
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        }
                    });

                    delay += 50;
                });   
            }

            //Load all the art
            this.scene.game.loaderManager.addJob(new LoaderJob(this.scene, textures, callback));
        }
    }

}