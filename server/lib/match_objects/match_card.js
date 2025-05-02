const Player = require("../game_objects/player");
const ServerAbilityFactory = require("../ability_manager/server_ability_factory");
const Match = require("./match");
const MatchAura = require("./match_aura");

const CARD_STATES = Object.freeze({
    IN_DECK: 'IN_DECK',
    IN_HAND: 'IN_HAND',
    IN_DISCARD: 'IN_DISCARD',
    IN_LIFEDECK: 'IN_LIFEDECK',

    BEING_PLAYED: 'BEING_PLAYED',

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
        
        this.previousState = null; //Previous state of the card 
        this.state = CARD_STATES.IN_DECK;
    }

    /** Function to set the state of the card
     * @param {string} state - state of the card
     */
    setState(state) {
        this.previousState = this.state;
        this.state = state;
    }
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
    constructor(cardIndex, id, cardData, matchId, owner) {
        super(id, owner);

        this.matchId = matchId;
        this.cardIndex = cardIndex;
        this.cardData = cardData;

        this.abilities = [];
        this.attachedDon = [];
        this.attachedCounter = [];
        
        this.eventCounterAmount = 0;
        this.turnEventPowerAmount = 0;
        this.gameEventPowerAmount = 0;

        this.basePower = cardData.power;
        this.currentPower = this.basePower; //Current power of the card

        this.baseCost = cardData.cost;
        this.currentCost = this.baseCost;

        this.turnPlayed = -1; //Turn played in the match

        this.auraToIgnore = null; //Aura to ignore for the power calculation

        //Create abilities if there are any
        if(cardData.abilities) {
            const match = matchRegistry.get(matchId);
            let abilityData = cardData.abilities.filter(ability => ability.type !== 'AURA');
            this.abilities = match.abilityFactory.createAbilitiesForCard(abilityData, id, matchId);
            
            //Create auras from cards
            let auraData = cardData.abilities.filter(ability => ability.type === 'AURA');
            for(let aura of auraData) {
                match.lastAuraID++;
                let auraId = match.lastAuraID;
                let newAura = new MatchAura(auraId, this.id, match.id, aura);
    
                match.auraManager.addAura(newAura); //Add aura to the match
            }
        }
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

    /** Function that returns all the targets for the abilities 
     * * @param {string} abilityId - ID of the ability
    */
    getAbilityTargets(abilityId = null) {
        let targets = null; //FIXME May need several target object
        for(let ability of this.abilities) {
            if(ability.target) targets = ability.target;

            if(abilityId && ability.id === abilityId) return targets;
        }
        return targets;
    }

    /** Function to get the current power of the card */
    getPower(activeTurn) {
        this.currentPower = this.basePower;
        if(activeTurn) this.currentPower += this.attachedDon.length * 1000;
        
        if(!activeTurn) {
            for(let attachedCounter of this.attachedCounter) this.currentPower += attachedCounter.cardData.counter;
            this.currentPower += this.eventCounterAmount;
        }
        this.currentPower += this.turnEventPowerAmount; //Add power from turn effects
        this.currentPower += this.gameEventPowerAmount; //Add power from permanent effects

        for(let ability of this.abilities) {
            if(ability.type === 'PASSIVE') this.currentPower += ability.addPassivePower();
        }

        //Get Power from aura effects
        let match = matchRegistry.get(this.matchId);
        for(let aura of match.auraManager.activeAuras) {
            if(aura.canActivate() && aura.id !== this.auraToIgnore) {
                this.auraToIgnore = aura.id; //Set the aura to ignore for the next power calculation
                if (aura.isValidTarget(this)) this.currentPower += aura.ability.addPassivePower(this);
                this.auraToIgnore = null; //Reset the aura to ignore if the target is not valid
            }
        }

        //console.log(`Power of ${this.id} is ${this.currentPower}`);

        return this.currentPower;
    }

    /** Function to get the current power of the card */
    getCost(activeTurn) {
        this.currentCost = this.baseCost;

        return this.currentCost;
    }

    /** Function that returns if the card has rush 
     * @returns {boolean}
    */
    hasRush() {
        if(this.debugRush) return true;
        let hasRush = false;
        for(let ability of this.abilities) {
            if(ability.type === 'PASSIVE') hasRush = hasRush ;
        }
        return hasRush;
    }

    /** Function taht returns if the card can block
     * @returns {boolean}
     */
    canBlock() {
        if(this.debugBlock) return true;
        let canBlock = true;
        
        //Get Power from aura effects
        let match = matchRegistry.get(this.matchId);
        for(let aura of match.auraManager.activeAuras) {
            if(aura.canActivate()) {
                if(aura.isValidTarget(this)) canBlock = canBlock && aura.ability.canBlock(this);
            }
        }

        //console.log(`Can ${this.id} block? ${canBlock}`);
    
        return canBlock;
    }

    /** Function that returns true is a card has an ability that triggers no attacking
     * @returns {boolean}
     */
    hasOnAttackEvents() {
        for(let ability of this.abilities) {
            if(ability.type === 'WHEN_ATTACKING' && ability.canActivate()) return true;
        }
        return false;
    }

    resetTurn() {
        this.turnEventPowerAmount = 0;
        for(let ability of this.abilities) ability.resetTurn();
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