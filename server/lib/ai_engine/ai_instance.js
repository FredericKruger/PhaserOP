const ServerInstance = require("../server_instance");
const Match = require("../match_objects/match");
const { CARD_TYPES } = require("../match_objects/match_enums");

class AI_Instance {

    /**
     * 
     * @param {ServerInstance} server 
     * @param {Match} match 
     */
    constructor(server, match) {
        this.server = server;
        this.match = match;
        this.matchPlayer = match.state.player2;
    }

    /** Function that performs the mulligan */
    mulligan() {
        //Test if there is a 1 cost and a 2 cost card in the hand
        let oneCost = false;
        let twoCost = false;
        for(let card of this.matchPlayer.inHand) {
            if(card.cardData.cost === 1) oneCost = true;
            else if(card.cardData.cost === 2) twoCost = true;
        }

        //If it finds a one cost and a two cast don't mulligan
        if(oneCost && twoCost) return [];
        else {
            let oldCard = this.matchPlayer.inHand;
            for(let card of oldCard) this.matchPlayer.removeCardFromHand(card); //Remove Cards from hand

            let newCards = this.match.state.drawCards(this.matchPlayer, 5); //Draw 5 new cards
            
            for(let card of oldCard) this.matchPlayer.deck.add(card); //Add old cards to deck
            this.matchPlayer.deck.shuffle(); //Shuffle deck

            return newCards;
        }
    }

    /** Function that performs the AI turn */
    play() {
        let action = this.canTakeAction();
        while(action.canTakeAction) {
            this.playAction(action.action); //Play the action
            action = this.canTakeAction();
        }

        this.endTurn();
    }

    /** Function that checks if the AI can take an action
     * Action Priority:
     * 1. Play a card
     * 3. Attach Don card
     * 2. Attack with a card
     */
    canTakeAction() {
        //Create an action object
        let action = {
            canTakeAction: false,
            action: {}
        };

        //Check if a card can be played (has enough active DON) and return an action if yes
        let playableCard = this.getPlayableCard();
        if(playableCard > -1) {
            action.canTakeAction = true;
            action.action = {
                function: 'playCard',
                arg: playableCard
            };
            return action;
        }

        return action;
    }

    /** Function called by the ai to finish his turn. Tells the game engine to start the next turn */
    endTurn(){
        this.match.state.current_passive_player.socket.emit('game_complete_current_turn');
    }

    /** Function that executes an action 
     * @param {Object} action
    */
    playAction(action) {
        if(action.function === 'playCard') {
            let cardid = action.arg;
            this.match.startPlayCard(this.match.state.current_active_player, cardid);
        }
    }

    /** Function that lets the ai determin if a card can be played */
    getPlayableCard() {
        let card = -1;
        //Look for playable character
        for(let c of this.matchPlayer.inHand) {
            if(c.cardData.cost <= this.matchPlayer.inActiveDon.length && c.cardData.card === CARD_TYPES.CHARACTER && this.matchPlayer.inCharacterArea.length < 5) {
                card = c.id;
                break;
            }
        }
        if(card > -1) return card;

        //If no playble character is found, look for a stage
        for(let c of this.matchPlayer.inHand) {
            if(c.cardData.cost <= this.matchPlayer.inActiveDon.length && c.cardData.card === CARD_TYPES.STAGE && this.matchPlayer.inStageLocation === null) {
                card = c.id;
                break;
            }
        }
        return card;
    }

}

module.exports = AI_Instance;