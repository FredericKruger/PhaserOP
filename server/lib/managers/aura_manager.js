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

    /** Function to remove the turn based auras
     * @return {Array<string>}
     */
    removeTurnAuras() {
        let auraIds = [];
        for(let i = this.activeAuras.length - 1; i >= 0; i--) {
            if(this.activeAuras[i].duration === "TURN") {
                auraIds.push(this.activeAuras[i].auraId);
                this.activeAuras.splice(i, 1);
            }
        }
        return auraIds;
    }

}

module.exports = AuraManager;