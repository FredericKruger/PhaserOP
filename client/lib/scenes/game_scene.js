class GameScene extends Phaser.Scene {

    constructor() {
        super(SCENE_ENUMS.GAME_SCENE);
    }

    init() {
        this.screenCenterX = this.cameras.main.worldView.x + this.cameras.main.displayWidth / 2;
        this.screenCenterY = this.cameras.main.worldView.y + this.cameras.main.displayHeight / 2;
        this.screenHeight = this.cameras.main.displayHeight;
        this.screenWidth = this.cameras.main.displayWidth;

        this.activePlayer = new Player(true, this.game.gameClient.decklist[0]);
        this.passivePlayer = new Player(false, []);

        this.activePlayerScene = new PlayerScene(this, PLAYER_POSITIONS.BOTTOM, this.activePlayer);
        this.passivePlayerScene = new PlayerScene(this, PLAYER_POSITIONS.TOP, this.passivePlayer);

        //Set Engines
        this.actionManager = new ActionManager(this);
        this.actionLibrary = new ActionLibrary(this);
        this.animationManager = new AnimationManager(this);

        //Game state variables
        this.dragginCard = false;
    }

    create() {
        //Prepare the background
        this.add.image(
            this.screenCenterX, this.screenCenterY, ASSET_ENUMS.BATTE_BACKGROUND_1
        )
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setDepth(0);

        this.add.image(10, this.screenCenterY, ASSET_ENUMS.GAME_PHASE_BOX).setScale(0.8).setOrigin(0, 0.5).setDepth(0).setAlpha(0.74);
        this.phaseText = this.add.text(30, this.screenCenterY, "Phase: 1", 
            {font: "30px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "left"}
        ).setOrigin(0, 0.5).setDepth(0);

        this.activePlayerScene.create();
        this.passivePlayerScene.create();

        //Create new card to test
        let cards = [];
        for(let id of [411,412,421,414,413, 415, 145]){
            let testCard = new GameCardUI(this, this.activePlayerScene, {
                x: this.screenCenterX,
                y: this.screenCenterY,
                cardData: null,
                state: CARD_STATES.IN_HAND,
                artVisible: false
            });
            testCard.updateCardData(this.game.gameClient.playerCollection.cardCollection[id-1]);
            testCard.makeInteractive(true);
            testCard.makeDraggable(true);
            cards.push(testCard);
        }
        this.activePlayerScene.hand.addCards(cards);
        //create leader Card
        /*let leaderCard = new GameCardUI(this, this.activePlayerScene, {
            x: this.screenCenterX,
            y: this.screenCenterY,
            cardData: null,
            state: CARD_STATES.IN_LOCATION,
            artVisible: false
        });
        leaderCard.updateCardData(this.game.gameClient.playerCollection.cardCollection[400]);*/
        //this.activePlayerScene.leaderLocation.addCard(leaderCard);

        /** LISTENERS */
        /** Hander for when the poinster enters a card */
        this.input.on('pointerover', (pointer, gameObject) => {
            if(gameObject[0] instanceof GameCardUI
                && !this.dragginCard
            ) {
                let card = gameObject[0];
                if(card.state === CARD_STATES.IN_HAND) {
                    card.setState(CARD_STATES.IN_HAND_HOVERED);
                    card.playerScene.hand.update();
                }
            }
        });

        /** Handler for when the pointer leaves a card */
        this.input.on('pointerout', (pointer, gameObject) => {
            if(gameObject[0] instanceof GameCardUI
                && !this.dragginCard
            ) {
                let card = gameObject[0];
                if(card.state === CARD_STATES.IN_HAND_HOVERED) {
                    card.setState(CARD_STATES.IN_HAND);
                    card.playerScene.hand.update();
                }
            }
        });

        /** HANLDER FOR CLICKING */
        this.input.on('pointerdown', (pointer, gameObject) => {
        });    


        /** HANDLER FOR DRAG START */
        this.input.on('dragstart', (pointer, gameObject) => {
            this.children.bringToTop(gameObject);
            this.dragginCard = true;

            gameObject.setState(CARD_STATES.TRAVELLING_FROM_HAND);
            gameObject.scaleTo(CARD_SCALE.TRAVELLING_FROM_HAND, true, false, false);
            gameObject.angleTo(0, true, false, false);

            gameObject.playerScene.hand.update();
        });

        /** HANDLDER FOR DRAG */
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.setPosition(dragX, dragY);
        });

        /** HANDLER FOR DRAGEN */
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if(!dropped) {
                //Reset the cards position
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;

                //Reset card state
                gameObject.setState(CARD_STATES.IN_HAND);
                gameObject.playerScene.hand.update();

                this.dragginCard = false;
            }
        });

        /** HANDLER FOR DROP */
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if(dropZone.getData('name') === 'CharacterArea') {
                gameObject.playerScene.playCard(gameObject);
            }

            this.dragginCard = false;
        });
    }

}