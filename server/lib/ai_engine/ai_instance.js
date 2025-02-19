const ServerInstance = require("../server_instance");
const Match = require("../match_objects/match");

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

}

module.exports = AI_Instance;