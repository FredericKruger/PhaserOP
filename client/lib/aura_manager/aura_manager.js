class AuraManager {

    constructor(scene) {
        this.scene = scene;

        this.activeAuras = []; //Active auras
    }

    /** Function to add an aura to the manager
     * * @param {Aura} aura - Aura to add
     */
    addAura(aura) {
        this.activeAuras.push(aura);
    }

    /** Function to remove an aura
     * * @param {string} auraId - Aura id to remove
     */
    removeAura(auraId) {
        this.activeAuras = this.activeAuras.filter(aura => aura.auraId !== auraId);
    }

}