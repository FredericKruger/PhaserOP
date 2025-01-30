class FirstLoginPanel extends Phaser.GameObjects.Container{

    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        
        this.obj = [];
        this.decks = [];

        // Create a semi-transparent overlay that takes up the whole window
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.9); // Black color with 50% opacity
        this.overlay.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.overlay);

        // Create a transparent panel that takes up the whole window
        this.transparentPanel = this.scene.add.graphics();
        this.transparentPanel.fillStyle(0xffffff, 0.1); // Black color with 50% opacity
        this.transparentPanel.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.transparentPanel);
       
        this.luffyDialogImg = this.scene.add.image(-this.scene.scale.width/4, -this.scene.scale.height/4, 'luffy_intro').setOrigin(0.5);
        this.obj.push(this.luffyDialogImg);

        this.starterMessage = this.scene.add.image(this.luffyDialogImg.x + 160, this.luffyDialogImg.y - 100, 'starter_message').setOrigin(0.5);
        this.starterMessage.setScale(0.2);
        this.obj.push(this.starterMessage);

        this.deckDescription = this.scene.add.image(0, 0, '').setScale(0.35).setOrigin(0.5);
        //this.obj.push(this.deckDescription);

        let separatorWidth = 50;
        let packArtStartX = -((346*0.5) * 1.5 + separatorWidth + separatorWidth/2);
        for(let i = 0; i<4; i++) {
            let deck = this.scene.add.image(packArtStartX, 50, 'packart_ST0' + (i+1)).setScale(0.5).setOrigin(0.5, 0.5);
            deck.setInteractive();
            deck.on('pointerover', () => {
                deck.setScale(0.6);
                this.deckDescription.x = deck.x;
                this.deckDescription.y = deck.y + 225;
                this.deckDescription.setTexture('description_ST0' + (i+1));
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

        this.add([this.overlay, this.transparentPanel, this.luffyDialogImg, this.starterMessage, this.decks[0], this.decks[1], this.decks[2], this.decks[3], this.deckDescription]);
        this.setSize(this.scene.scale.width, this.scene.scale.height);

        this.scene.add.existing(this);

        this.setVisible(false);

        this.setInteractive();
        this.on('pointerdown', (pointer) => {
        });
    }

    launch() {
        this.setVisible(true);
    }

    setVisible(visible) {
        for(let o of this.obj) o.setVisible(visible);
        this.deckDescription.setVisible(false);
    }

    deckSelected(index) {
        GameClient.addDeckToCollection("ST0" + (index+1));
    }

    closePanel() {
        this.setVisible(false);
        this.destroy();
    }

}