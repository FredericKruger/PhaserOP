const Match = require('./match');
const { CARD_STATES } = require('./match_card');
const { PLAY_CARD_STATES, CARD_TYPES, ATTACH_DON_TO_CHAR_STATES } = require('./match_enums');
const MatchPlayer = require('./match_player')

const MATCH_PHASES = Object.freeze({
    WAITING_TO_START: 'WAITING_TO_START',
    SETUP: 'SETUP',
    MULLIGAN_PHASE: 'MULLIGAN_PHASE',
    MULLIGAN_PHASE_OVER: 'MULLIGAN_PHASE_OVER',
    PREPARING_FIRST_TURN: 'PREPARING_FIRST_TURN',

    REFRESH_PHASE: 'REFRESH_PHASE',
    DRAW_PHASE: 'DRAW_PHASE',
    DON_PHASE: 'DON_PHASE',
})

class MatchState {

    /**
     * Constructor on the Match State class
     * @param {Match} match 
     */
    constructor(match) {
        this.match = match;

        this.current_active_player = null;
        this.current_passive_player = null;
        this.current_phase = MATCH_PHASES.WAITING_TO_START;

        this.player1 = new MatchPlayer();
        this.player2 = new MatchPlayer();
    }

    /** Function that makes a player draw a number of cards
     * @param {number} numberCards - number of cards to be drawn
     * @param {MatchPlayer} player - player: either 'a' or 'b'
     * @return {Array<number>} returns a list of card ids that where drawn
     * Function will remove the number of cards from the deck and add it to the player and
     */
    drawCards(player, numberCards) {
        let cards = [];
        
        for(let i=0; i<numberCards; i++) { //Draw required cards
            let card = player.deck.draw(); //Remove from player deck
            cards.push(card); //Add to hand and return list
            player.inHand.push(card);
        }
        return cards;
    }

    /** Function that mulligans the cards
     * @param {MatchPlayer} player - player object
     * @param {Array<number>} cards - list of card ids to be mulliganed
     */
    mulliganCards(player, cards) {
        let newCards = []; //Store the new cards

        //Draw new cards
        for(let i=0; i<cards.length; i++) 
            newCards.push(player.deck.draw());

        //Add the old cards to the hand
        for(let card of player.inHand) 
            player.deck.add(card);

        //Empty the hand and add new cards
        player.inHand = [];
        for(let card of newCards) player.inHand.push(card);

        //reshuffle the deck
        player.deck.shuffle();

        return newCards;
    }

    /** Function that distributes cards in the life pool for the player 
     * @param {MatchPlayer} player - player object
     */
    addCardToLifeDeck(player) {
        let cards = [];
        for(let i=0; i<player.inLeaderLocation.cardData.life; i++) {
            let card = player.deck.draw();
            cards.push(card.id);
            player.inLifeDeck.push(card);
        }
        return cards;
    }

    /** Function that returns all attached DON cards to the don Area
     * @param {MatchPlayer} player - player object
     */
    refreshDon(player) { //TODO handle cards attached
        let cards = [];
        let numberOfExertedDon = player.inExertenDon.length; //Need to save initial value or the loop will break
        for(let i=0; i<numberOfExertedDon; i++) {
            let card = player.inExertenDon.pop();
            card.setState(CARD_STATES.READY);
            player.inActiveDon.push(card);
            cards.push(card.id);
        }
        return cards;
    }

    /** Function that refreshed all exerted charactes to active
     * @param {MatchPlayer} player - player object
     */
    refreshCards(player) {
        let cards = [];
        for(let i=0; i<player.inCharacterArea.length; i++) {
            let card = player.inCharacterArea[i];
            if(card.state === CARD_STATES.EXERTED) {
                card.setState(CARD_STATES.READY);
                cards.push(card.id);

                card.attachedDon = []; //Reset the attach don pointer
            }
        }
        if(player.inLeaderLocation.state === CARD_STATES.EXERTED) {
            player.inLeaderLocation.setState(CARD_STATES.READY);
            cards.push(player.inLeaderLocation.id);

            player.inLeaderLocation.attachedDon = []; //Reset the attach don pointer
        }
        return cards;
    }

    /** Start Draw Phase. First players do not draw a card on their first turn
     * @param {MatchPlayer} player
     */
    startDrawPhase(player) {
        let playerCards = [];
        if(!(player.isFirstPlayer && player.isFirstTurn)) {
            playerCards = this.drawCards(player, 1);
        }

        return playerCards;
    }

    /**
     * Function that runs the Don Phase
     * @param {MatchPlayer} player 
     */
    startDonPhase(player) {
        //During the don phase the player draws a certain amount of don cards from the pile to the don area
        let donCards = [];
        if(player.isFirstPlayer && player.isFirstTurn) { //If the player is the first player and its the firs turn only draw a single DON
            let donCard = player.inDon.pop();
            player.inActiveDon.push(donCard);
            donCards.push(donCard.id);
        } else {
            //If not draw up to 2 cards if possible
            for(let i=0; i<2; i++) {
                if(player.inDon.length > 0) {
                    let donCard = player.inDon.pop();
                    player.inActiveDon.push(donCard);
                    donCards.push(donCard.id);
                }
            }
        }

        //Returns cards to the match
        return donCards;
    }

    /** Function that determines if a card can be played
     * @param {MatchPlayer} player - player object
     * @param {number} cardId - card id
     */
    playCard(player, cardId) {
        //Check the card cost and wether there are enough resources to play the card
        let card = player.inHand.find(card => card.id === cardId);
        let cardCost = card.cardData.cost;
        let availableActiveDon = player.inActiveDon.length;

        if(cardCost>availableActiveDon) return {actionResult: PLAY_CARD_STATES.NOT_ENOUGH_DON, actionInfos: {playedCard: cardId}};

        let actionInfos = {};
        //If the player has enough resources remove the resources and play the card
        if(card.cardData.card === CARD_TYPES.STAGE) {
            if(!player.inStageLocation) { //If the state
                actionInfos = player.playStage(cardId, false);
                return {actionResult: PLAY_CARD_STATES.STAGE_PLAYED, actionInfos: actionInfos};
            } else {
                actionInfos = player.playStage(cardId, true);
                return {actionResult: PLAY_CARD_STATES.STAGE_REPLACED_AND_PLAYED, actionInfos: actionInfos};
            };
        } else if(card.cardData.card === CARD_TYPES.CHARACTER) { //If the card is a character
            if(player.inCharacterArea.length < 5) {
                actionInfos = player.playCharacter(cardId, false);
                return {actionResult: PLAY_CARD_STATES.CHARACTER_PLAYED, actionInfos: actionInfos};
            } else {
                console.log("TARGETING")
                actionInfos = {actionResult: PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET, actionInfos: {playedCard: cardId}};
                return {actionResult: PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET, actionInfos: actionInfos};
            }
        } else if(card.cardData.card === CARD_TYPES.EVENT) { //TODO: Implement event card
        }
    }

    /** Function that handles attaching a don card to a character
     * @param {MatchPlayer} player - player object
     * @param {number} donID - don card id
     * @param {number} characterID - character card id
     */
    startAttachDonToCharacter(player, donID, characterID) {
        let donCard = player.inActiveDon.find(card => card.id === donID);

        if(donCard.state === CARD_STATES.READY) {
            let characterCard = null;
            if(player.inLeaderLocation.id === characterID) characterCard = player.inLeaderLocation; //First look in the leader location
            else characterCard = player.inCharacterArea.find(card => card.id === characterID); //If not found then look in the character area

            //Attach the don card to the character and modify the state
            player.inActiveDon.filter(card => card.id !== donID);
            donCard.setState(CARD_STATES.EXERTED);
            player.inExertenDon.push(donCard);
            characterCard.attachedDon.push(donID);

            return {actionResult: ATTACH_DON_TO_CHAR_STATES.DON_ATTACHED, actionInfos: {attachedDonCard: donID, receivingCharacter: characterID}};
        } else {
            return {actionResult: ATTACH_DON_TO_CHAR_STATES.DON_NOT_READY, actionInfos: {attachedDonCard: donID, receivingCharacter: characterID}};
        }
    }
}

module.exports = {
    MATCH_PHASES: MATCH_PHASES,
    MatchState: MatchState
};