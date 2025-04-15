class BaseCardUI extends Phaser.GameObjects.Container {

    //#region CONSTRUCTOR
    /** COnstructor
     * @param {GameScene} scene - The scene where the card is going to be
     * @param {PlayerScene} playerScene - The player scene where the card is going to be
     * @param {Object} config - Configuration object
     */
    constructor(scene, playerScene, config) {
        super(scene, config.x, config.y);

        this.scene = scene;
        this.playerScene = playerScene;

        this.state = config.state;
        this.previousState = this.state;
        
        this.artVisible = config.artVisible;
        this.artFullyVisible = false;
        this.currentScale = config.scale;
        this.cardDepth = config.depth;

        this.obj = [];

        this.hasGlow = false;

        //Create card
        this.create();
        this.add(this.obj);

        //Add Scene
        this.setSize(this.backArt.width, this.backArt.height);
        this.scene.add.existing(this);

        this.setDepth(this.cardDepth);

        this.makeInteractive(true);
        if(playerScene.player.isActivePlayer) this.makeDraggable(true);
    }
    //#endregion

    //#region CREATE FUNCTION
    /** Function to create the card */
    create() {
        //Prepare backart
        this.backArt = this.scene.add.image(0, 0, ASSET_ENUMS.CARD_BACK1).setOrigin(0.5);
        this.backArt.setVisible(!this.artVisible);
        this.obj.push(this.backArt);

        //Prepare frontart
        this.frontArt = this.scene.add.image(0, 0, '').setOrigin(0.5);
        this.frontArt.setVisible(this.artVisible);
        this.obj.push(this.frontArt);

        this.setScale(this.currentScale);
    }
    //#endregion

    //#region FLIP FUNCTION
    /** Function that flips the card */
    flipCard() {
        this.artVisible = !this.artVisible;
        this.frontArt.setVisible(this.artVisible);
        this.backArt.setVisible(!this.artVisible);
    }
    //#endregion

    //#region UTILS
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

    /** Set card scale depending on the state 
     * @param {number} scale
    */
    setStateScale(scale) {
        this.currentScale = scale;
        this.setScale(scale);
    }
    //#endregion

    //#region TWEEN FUNCTIONS
    /** Function that moves the card to a location
     * @param {number} x
     * @param {number} y
     * @param {boolean} useTween
     * @param {boolean} chainTween
     * @param {boolean} clearPreviousTween
     */
    moveTo(x, y, useTween, chainTween, clearPreviousTween) {
        if(clearPreviousTween) this.scene.tweens.killTweensOf(this);

        let duration = 200;
        if(this.state === CARD_STATES.TRAVELLING_DECK_HAND) duration = 700;

        if(useTween) {
            this.scene.tweens.add({
                targets: this,
                x: x,
                y: y,
                duration: duration,
                ease: 'linear',
                onComplete: () => {
                    this.x = x;
                    this.y = y;

                    if(this.state === CARD_STATES.TRAVELLING_DECK_HAND) this.setState(CARD_STATES.IN_HAND);
                }
            });
        } else {
            this.x = x;
            this.y = y;
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
                    this.currentScale = scale;
                    this.setScale(this.currentScale);
                }
            });
        } else {
            this.currentScale = scale;
            this.setScale(currentScale);
        }
    }
    //#endregion
       
    //#region FX FUNCTIONS
    /** Show Glow
     * 
     */
    showGlow(color) {
        if(!this.hasGlow) {
            this.fx = this.postFX.addGlow(color, 3);
            this.glowAnimation = this.scene.tweens.add({
                targets: this.fx,
                outerStrength: 10,
                duration:2000,
                alpha:0.8,
                ease: 'Sine.inout',
                yoyo: true,
                repeat: -1
            });
            this.hasGlow = true;
        }
    }

    /** Hide Glow */
    hideGlow() {
        if(this.hasGlow) {
            this.postFX.clear();
            this.glowAnimation.stop();
            this.hasGlow = false;
        }
    }
    //#endregion
}