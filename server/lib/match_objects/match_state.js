const Match = require('./match')
const MatchPlayer = require('./match_player')

const MATCH_PHASES = Object.freeze({
    WAITING_TO_START: 'WAITING_TO_START',
    SETUP: 'SETUP',
    MULLIGAN_PHASE: 'MULLIGAN_PHASE',
    MULLIGAN_PHASE_OVER: 'MULLIGAN_PHASE_OVER',
    PREPARING_FIRST_TURN: 'PREPARING_FIRST_TURN',
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
        player.inHand.concat(newCards);

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

    /** Function that does the house keeping or the current player */
    newTurn(player) {
        //Need to return don cards to the don deck

    }


    /**
     * Function that runs the Don Phase
     * @param {MatchPlayer} player 
     */
    startDonPhase(player) {
        //During the don phase the player draws a certain amount of don cards from the pile to the don area
        let donCards = [];
        console.log(player.isFirstPlayer + ' ' + player.isFirstTurn)
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
}

module.exports = {
    MATCH_PHASES: MATCH_PHASES,
    MatchState: MatchState
};