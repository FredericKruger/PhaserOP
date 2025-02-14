class GameCardUI extends Phaser.GameObjects.Container {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {Object} config 
     */
    constructor(scene, playerScene, config){ 
        super(scene, config.x, config.y);

        this.scene = scene;
        this.playerScene = playerScene;
        
        this.cardData = config.cardData;

        this.state = config.state;    
        this.artVisible = config.artVisible;

        //STATE VARIABLES
        this.isInPlayAnimation = false;

        this.obj = [];

        //Create card
        this.create();

        //Add all elements to the container
        this.add(this.obj);

        //Add Scene
        this.setSize(this.backArt.width, this.backArt.height);
        this.scene.add.existing(this);
        this.setDepth(1);
    }

    /**Function to create the card */
    create() {
        //Prepare backart
        this.backArt = this.scene.add.image(0, 0, ASSET_ENUMS.CARD_BACK1).setOrigin(0.5);
        this.backArt.setVisible(!this.artVisible);
        this.obj.push(this.backArt);

        //Prepare frontart
        this.frontArt = this.scene.add.image(0, 0, '').setOrigin(0.5);
        this.frontArt.setVisible(this.artVisible);
        this.obj.push(this.frontArt);

        //Prepare power box
        this.powerBox = this.scene.add.graphics();
        this.drawPowerBox(COLOR_ENUMS.OP_BLACK);
        this.powerBox.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.powerBox);

        //In Location Power Text
        this.locationPowerText = this.scene.add.text(
            0, this.backArt.displayHeight*0.5, '',
            {font: "1000 150px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "center",
                stroke: COLOR_ENUMS_CSS.OP_BLACK, strokeThickness: 10
            }
        ).setOrigin(0.5);
        this.obj.push(this.locationPowerText);

        //Prepare cost icon
        this.costIcon = this.scene.add.image(-this.backArt.displayWidth*0.46, -this.backArt.displayHeight*0.46, '');
        this.costIcon.setScale(1.8);
        this.costIcon.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 4);
        this.costIcon.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.costIcon);

        //Prepare powerTest
        this.powerText = this.scene.add.text(
            -this.backArt.displayWidth*0.5 + this.backArt.displayWidth*0.06, 
            -this.backArt.displayHeight*0.5 + this.backArt.displayHeight*0.175, 
            "10000", 
            {font: "60px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "right"}
        );
        this.powerText.setAngle(-90);
        this.powerText.setOrigin(1, 0.5);
        this.powerText.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.powerText);

        //Prepare counter icon
        this.counterIcon = this.scene.add.image(-this.backArt.displayWidth*0.5 + this.backArt.displayWidth*0.175, -this.backArt.displayHeight*0.5 + this.backArt.displayHeight*0.015, ASSET_ENUMS.ICON_COUNTER);
        this.counterIcon.setScale(0.25);
        this.counterIcon.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.counterIcon);
    }

    //Draw the powerBox 
    drawPowerBox(color) {
        this.powerBox.clear();
        this.powerBox.fillStyle(color, 1); // Black color with 50% opacity
        this.powerBox.fillRoundedRect(
            -this.backArt.displayWidth*0.5, 
            -this.backArt.displayHeight*0.5, 
            this.backArt.displayWidth*0.12,
            this.backArt.displayHeight, 
            {tl: 10, tr: 0, br: 0, bl:10}); // 10 is padding, 15 is corner
    }

    /** Update Card Data */
    updateCardData(cardData) {
        this.cardData = cardData;
        
        let textures = [];
        let cardArtKey = this.cardData.art;

        let callback = () => {
            this.frontArt.setTexture(this.cardData.art);
            this.costIcon.setTexture(this.scene.game.utilFunctions.getCardCost(this.cardData.colors, this.cardData.cost));
            this.drawPowerBox(this.scene.game.utilFunctions.getCardColor(this.cardData.colors[0]));
            this.powerText.setText(this.cardData.power);
            this.counterIcon.setVisible(this.cardData.counter && this.state === CARD_STATES.IN_HAND);
            this.locationPowerText.setText(this.cardData.power);
            this.locationPowerText.setVisible(this.state === CARD_STATES.IN_LOCATION);
            this.flipCard();
        };

        textures.push({
            key: cardArtKey,
            path: `assets/cardart/${cardArtKey}.png`
        });
        this.scene.game.loaderManager.addJob(new LoaderJob(this.scene, textures, callback));       
    }

    /** Function that makes a card interactive
     * @param {boolean} interactive
     */
    makeInteractive(interactive) {
        if(interactive) {
            this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.backArt.width, this.backArt.height), Phaser.Geom.Rectangle.Contains);
        }
        else this.removeInteractive();
    }

    /** Function that makes a card draggable
     * @param {boolean} draggable
     */
    makeDraggable(draggable) {
        if(draggable) {
            this.scene.input.setDraggable(this);
        } else {
            this.scene.input.setDraggable(this, false);
        }   
    }

    /** Set card scale depending on the state */
    setStateScale(state) {
        this.setScale(scale);
    }

    /** Set card state */
    setState(state) {
        this.state = state;

        this.powerBox.setVisible(this.state === CARD_STATES.IN_HAND);
        this.costIcon.setVisible(this.state === CARD_STATES.IN_HAND);
        this.powerText.setVisible(this.state === CARD_STATES.IN_HAND);
        this.counterIcon.setVisible(this.cardData.counter && this.state === CARD_STATES.IN_HAND);
        this.locationPowerText.setVisible(this.state === CARD_STATES.IN_LOCATION);
    }

    /** Function that flips the card */
    flipCard() {
        this.artVisible = !this.artVisible;
        this.frontArt.setVisible(this.artVisible);
        this.backArt.setVisible(!this.artVisible);
    }

    /** Function that moves the card to a location
     * @param {number} x
     * @param {number} y
     * @param {boolean} useTween
     * @param {boolean} chainTween
     * @param {boolean} clearPreviousTween
     */
    moveTo(x, y, useTween, chainTween, clearPreviousTween) {
        if(clearPreviousTween) this.scene.tweens.killTweensOf(this);

        if(useTween) {
            this.scene.tweens.add({
                targets: this,
                x: x,
                y: y,
                duration: 200,
                ease: 'linear',
                onComplete: () => {
                    this.x = x;
                    this.y = y;
                }
            });
        } else {
            this.x = x;
            this.y = y;
        }
    }

    /** Function that sclaes the card to a value
     * @param {number} x
     * @param {number} y
     * @param {boolean} useTween
     * @param {boolean} chainTween
     * @param {boolean} clearPreviousTween
     */
    scaleTo(scale, useTween, chainTween, clearPreviousTween) {
        if(clearPreviousTween) this.scene.tweens.killTweensOf(this);

        if(useTween) {
            this.scene.tweens.add({
                targets: this,
                scale: {from : this.scale, to: scale},
                duration: 200,
                ease: 'linear',
                onComplete: () => {
                    this.setScale(scale);
                }
            });
        } else {
            this.setScale(scale);
        }
    }

    /** Function that changes the angle of the object
     * @param {number} angle
     * @param {boolean} useTween
     * @param {boolean} chainTween
     * @param {boolean} clearPreviousTween
     * @param {boolean} clearPreviousTween
     */
    angleTo(angle, useTween, chainTween, clearPreviousTween) {
        if(clearPreviousTween) this.scene.tweens.killTweensOf(this);

        if(useTween) {
            this.scene.tweens.add({
                targets: this,
                angle: {from : this.angle, to: angle},
                duration: 200,
                ease: 'linear',
                onComplete: () => {
                    this.setAngle(angle);
                }
            });
        } else {
            this.setAngle(angle);
        }
    }


}