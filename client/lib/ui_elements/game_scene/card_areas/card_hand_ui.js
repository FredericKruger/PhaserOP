class CardHandUI extends CardPileUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     */
    constructor(scene, playerScene) {
        super(scene, playerScene);

        //Set Y position
        this.posY = this.posX = 0;
        this.angleStep = 2; // Adjust this value to change the angle between cards
        this.heightStep = 5; // Adjust this value to change the height difference between cards

        if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.posY = this.scene.screenCenterY + this.scene.screenHeight / 2 - 50;
            this.posX = this.scene.screenWidth * 0.75;
        } else {
            this.posY = 50;
            this.posX = this.scene.screenWidth * 0.25;
            this.heightStep *= -1;
            this.angleStep *= -1;
        }
    }

    /** Function to update the hand */
    update() {
        let numberCards = Math.max(this.getNumberCardsInHand()-1, 0);
        let currentIndex = numberCards/2 - numberCards;

        let currentScale = CARD_SCALE.IN_HAND;
        let currentScaleHovered = CARD_SCALE.IN_HAND_HOVERED;
        if(!this.playerScene.player.isActivePlayer) {
            currentScale = CARD_SCALE.IN_HAND_PASSIVE_PLAYER;
            currentScaleHovered = CARD_SCALE.IN_HAND_HOVERED_PASSIVE_PLAYER;
        }

        //find the index of the card currently hovered
        let hoverIndex = -1;
        //Find if a card is being hovered
        for(let i = 0; i<this.cards.length; i++) {
            if(this.cards[i].state === CARD_STATES.IN_HAND_HOVERED) {
                hoverIndex = i;
                break;
            }
        }

        //Iterate through cards
        for(let i=0; i<this.cards.length; i++) {
            let card = this.cards[i];
            if(card.state === CARD_STATES.IN_HAND || card.state === CARD_STATES.TRAVELLING_TO_HAND 
                || card.state === CARD_STATES.IN_HAND_PASSIVE_PLAYER || card.state === CARD_STATES.IN_HAND_HOVERED_PASSIVEPLAYER) {
                let cardX = this.posX + currentIndex * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * GAME_UI_CONSTANTS.HAND_CARD_SEPARATION * currentScale);
                let cardY = this.posY + Math.abs(currentIndex) * this.heightStep;
                let cardAngle = currentIndex * this.angleStep;

                if(card.state === CARD_STATES.IN_HAND_HOVERED_PASSIVEPLAYER) cardY += 30; //To simulate the card being hovered on

                if(hoverIndex>-1) {
                    if(i<hoverIndex) {
                        cardX -= (GAME_UI_CONSTANTS.CARD_ART_WIDTH * currentScaleHovered * 0.5);// - 10;
                    } else if(i>hoverIndex) { 
                        cardX += (GAME_UI_CONSTANTS.CARD_ART_WIDTH * currentScale * 0.5)// - 10;
                    } 
                }

                card.moveTo(cardX, cardY, true, false, false);
                card.scaleTo(currentScale, true, false, false);
                card.angleTo(cardAngle);

                currentIndex++;
            } else if(card.state === CARD_STATES.IN_HAND_HOVERED) { //If the card is hovered, zoom in and bring the card up
                let cardX = this.posX + Math.floor(currentIndex) * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * GAME_UI_CONSTANTS.HAND_CARD_SEPARATION * currentScale);
                let cardY = this.posY - (card.scale * GAME_UI_CONSTANTS.CARD_ART_HEIGHT * 0.65 - 50);// - (Math.abs(currentIndex) * this.heightStep);
                let cardAngle = currentIndex * this.angleStep;

                card.moveTo(cardX, cardY, true, false, false);
                card.scaleTo(currentScaleHovered, true, false, false);
                card.angleTo(cardAngle);

                currentIndex++;
            }
            this.scene.children.bringToTop(card); //TODO FIX THIS
            //if(card.playerScene.player.isActivePlayer) this.scene.children.bringToTop(card);
            //else {
            //    if(i>0) this.scene.children.moveAbove(card, this.cards[i-1]);
            //} //reorder the cards if they are in the main player's hand and not in the mulligan
        }
    }

    /**
     * Function that returns the number of cards in the hand
     * @returns {number}
     */
    getNumberCardsInHand() {
        let numberCards = 0;
        for(let card of this.cards) {
            //if(card.state === CARD_STATES.IN_HAND) {
            if(card.state.startsWith('IN_HAND')) {                
                numberCards++;
            }   
        }
        return numberCards;
    }

    /**
     * Function that adds new cards to the hand
     * @param {Array<GameCardUI>} cards
    * @param {Object} config
     */
    addCards(cards, config = {setCardState: false, setCardDepth: false, setCardInteractive: false, setCardDraggable: false, updateUI: false}) {
        for(let card of cards){
            if(config.setCardDepth) card.setDepth(2);
            if(config.setCardInteractive) card.makeInteractive(true);
            if(config.setCardDraggable) card.makeDraggable(true);
            if(config.setCardState) {
                if(card.playerScene.player.isActivePlayer) card.setState(CARD_STATES.IN_HAND);
                else card.setState(CARD_STATES.IN_HAND_PASSIVE_PLAYER);
            }
            this.cards.push(card);
        } 

        if(config.updateUI) this.update();
    }

    /** Function that removes a card from the hand
     * @param {GameCardUI} card
     */
    removeCard(card) {
        let index = this.cards.indexOf(card);
        if(index > -1) {
            this.cards.splice(index, 1);
        }
        this.update();
    }

    /** Function that makes all the cards in than draggable 
     * @param {boolean} draggable
    */
    makeCardDraggable(draggable) {
        for(let card of this.cards) card.makeDraggable(draggable);
    }


}