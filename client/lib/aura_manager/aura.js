class Aura {
    constructor(scene, card, id, auraData) {
        this.scene = scene;
        this.card = card;
        this.id = id;

        this.duration = auraData.aurainfo.duration;
        this.affectedPlayers = auraData.aurainfo.affectedPlayers;

        //Abilities
        /** @type {Array<Ability>} */
        this.ability = null;
        AbilityFactory.attachAbilityToAura(this, this.card, auraData); //Create the abilities
    }
}