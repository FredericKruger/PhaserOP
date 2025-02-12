class FirstLoginPanel extends Phaser.GameObjects.Container{

    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        
        this.obj = [];
        this.decks = [];

        const screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;

        // Create a semi-transparent overlay that takes up the whole window
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(COLOR_ENUMS.OP_BLACK, 0.7); // Black color with 50% opacity
        this.overlay.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.overlay);
        

        // Create a transparent panel that takes up the whole window
        this.transparentPanel = this.scene.add.graphics();
        this.transparentPanel.fillStyle(COLOR_ENUMS.OP_WHITE, 0.1); // Black color with 50% opacity
        this.transparentPanel.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.transparentPanel);
       
        this.luffyDialogImg = this.scene.add.image(-this.scene.scale.width/4, -this.scene.scale.height/4, ASSET_ENUMS.IMAGE_INTRO_LUFFY).setOrigin(0.5);
        this.obj.push(this.luffyDialogImg);

        this.starterMessage = this.scene.add.image(this.luffyDialogImg.x + 160, this.luffyDialogImg.y - 100, ASSET_ENUMS.IMAGE_INTRO_STARTER_MESSAGE).setOrigin(0.5);
        this.starterMessage.setScale(0.2);
        this.obj.push(this.starterMessage);

        this.deckDescription = this.scene.add.image(0, 0, '').setScale(0.35).setOrigin(0.5);

        // Create the animated sprite
        this.waitingAnimation = this.scene.add.sprite(
            -this.scene.scale.width/2+100,
            this.scene.scale.height/2-75, 
            ASSET_ENUMS.SKULL_SPRITESHEET).setScale(0.5).setOrigin(0.5);
        this.waitingAnimation.setVisible(false);

        let separatorWidth = 50;
        let packArtStartX = -((346*0.5) * 1.5 + separatorWidth + separatorWidth/2);
        for(let i = 0; i<4; i++) {
            let deck = this.scene.add.image(packArtStartX, 50, `PACK_ART_ST0${(i+1)}`).setScale(0.5).setOrigin(0.5, 0.5);
            deck.setInteractive();
            deck.on('pointerover', () => {
                deck.setScale(0.6);
                this.deckDescription.x = deck.x;
                this.deckDescription.y = deck.y + 225;
                this.deckDescription.setTexture(`IMAGE_INTRO_DESCRIPTION_ST0${(i+1)}`);
                this.deckDescription.setVisible(true);
            });
            deck.on('pointerout', () => {
                deck.setScale(0.5);
                this.deckDescription.texture = '';
                this.deckDescription.setVisible(false);
            });
            deck.on('pointerdown', () => {this.deckSelected(i)});
            this.decks[i] = deck;
            this.obj.push(deck);

            packArtStartX += (346*0.5) + separatorWidth;
        }

        this.add([this.overlay, this.transparentPanel, this.luffyDialogImg, this.starterMessage, this.decks[0], this.decks[1], this.decks[2], this.decks[3], this.deckDescription, this.waitingAnimation]);
        this.setSize(this.scene.scale.width, this.scene.scale.height);

        this.scene.add.existing(this);

        this.setVisible(false);
        this.setDepth(3);

        this.setInteractive();
        this.on('pointerdown', (pointer) => {
        });
    }

    /** Function that shows the panel */
    launch() {
        this.setVisible(true);
    }

    /** Function that sets the visibility of the panel
     * @param {boolean} visible - The visibility of the panel
     */
    // @ts-ignore
    setVisible(visible) {
        for(let o of this.obj) o.setVisible(visible);
        this.deckDescription.setVisible(false);
    }

    /** Function that handles the selection of the panel
     * @param {number} index - The index of the deck selected
     */
    deckSelected(index) {
        this.waitingAnimation.setVisible(true);
        this.waitingAnimation.play(ANIMATION_ENUMS.SKULL_WAITING_ANIMATION);
        this.scene.game.gameClient.addDeckToCollection("ST0" + (index+1));
    }

    /** Function that closes the panel */
    closePanel() {
        this.scene.time.delayedCall(500, () => {
            this.waitingAnimation.stop();
            this.waitingAnimation.setVisible(false);
            this.setVisible(false);
            this.destroy();
        });
    }

}