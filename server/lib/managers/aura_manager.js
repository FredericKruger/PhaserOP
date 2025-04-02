const MatchAura = require("../match_objects/match_aura");

class AuraManager {

    constructor(matchId) {
        this.matchId;

        /** @type {Array<MatchAura>} */
        this.activeAuras = []; // Array of active auras
    }

    /** Function to add an aura
     * * @param {MatchAura} aura - Aura to add
     */
    addAura(aura) {
        this.activeAuras.push(aura);
    }

}

module.exports = AuraManager;