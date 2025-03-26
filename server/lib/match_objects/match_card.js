const Player = require("../game_objects/player");
const ServerAbilityFactory = require("../ability_manager/server_ability_factory");
const Match = require("./match");

const CARD_STATES = Object.freeze({
    IN_DECK: 'IN_DECK',
    IN_HAND: 'IN_HAND',
    IN_DISCARD: 'IN_DISCARD',
    IN_LIFEDECK: 'IN_LIFEDECK',

    IN_PLAY: 'IN_PLAY',
    IN_PLAY_RESTED: 'IN_PLAY_RESTED',
    IN_PLAY_FIRST_TURN: 'IN_PLAY_FIRST_TURN',
    IN_PLAY_ATTACHED: 'IN_PLAY_ATTACHED',
    IN_PLAY_ATTACKING: 'IN_PLAY_ATTACKING',
    IN_PLAY_DEFENDING: 'IN_PLAY_DEFENDING',
    IN_PLAY_TARGETTING: 'IN_PLAY_TARGETTING',

    IN_DON_DECK: 'IN_DON_DECK',
    DON_ACTIVE: 'DON_ACTIVE',
    DON_RESTED: 'DON_RESTED',
    DON_ATTACHED: 'DON_ATTACHED',
});

/** Base Card Class */
class Card {

    /** Constructor
     * @param {number} id - card id
     */
    constructor(id, owner) {
        this.id = id;
        this.owner = owner;
        
        this.state = CARD_STATES.READY;
    }

    /** Function to set the state of the card
     * @param {string} state - state of the card
     */
    setState(state) {this.state = state;}
}

/** Plaing card class */
class MatchCard extends Card{

    /**
     * 
     * @param {number} cardIndex 
     * @param {number} id 
     * @param {Object} cardData 
     * @param {Match} match
     */
    constructor(cardIndex, id, cardData, match, owner) {
        super(id, owner);

        this.cardIndex = cardIndex;
        this.cardData = cardData;

        this.abilities = ServerAbilityFactory.createAbilitiesForCard(this.cardData.abilities);;
        this.attachedDon = [];
        this.attachedCounter = [];
        this.eventCounterAmount = 0;

        this.state = CARD_STATES.IN_DECK;

        this.currentPower = cardData.power;
    }

    /** Function that gets an ability from the card
     * @param {string} abilityId - ID of the ability
     */
    getAbility(abilityId) {
        return this.abilities.find(ability => ability.id === abilityId);
    }

    /** Function that gets an ability from the card according to type
    * @param {string} type - ID of the ability
    */
    getAbilityByType(type) {
        return this.abilities.find(ability => ability.type === type);
    }

    /** Function that returns all the targets for the abilities */
    getAbilityTargets() {
        let targets = null; //FIXME May need several target object
        for(let ability of this.abilities) {
            if(ability.target) targets = ability.target;
        }
        return targets;
    }

    getPower(activeTurn) {
        let power = this.currentPower;
        if(activeTurn) power += this.attachedDon.length * 1000;
        
        if(!activeTurn) {
            for(let attachedCounter of this.attachedCounter) power += attachedCounter.cardData.counter;
            power += this.eventCounterAmount;
        }

        let passivePower = 0;
        for(let ability of this.abilities) {
            if(ability.type === 'PASSIVE') {
                passivePower += ability.addPassivePower(this, '');
                if(passivePower !== 0) console.log('Passive Power: ' + passivePower);
            }
        }
        power += passivePower;

        return power;
    }

}

/**Don Card Class */
class MatchDonCard extends Card{

    constructor(id, owner) {
        super(id, owner);

        this.state = CARD_STATES.IN_DON_DECK
    }
}

module.exports = {
    MatchCard: MatchCard,
    MatchDonCard: MatchDonCard,
    CARD_STATES: CARD_STATES
};