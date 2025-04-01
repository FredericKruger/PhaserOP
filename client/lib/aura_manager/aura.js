class Aura {
    constructor(scene, id, auraData) {
        this.scene = scene;
        this.id = id;

        this.duration = auraData.duration;
        this.affectedPlayers = auraData.affectedPlayers;

        //Abilities
        /** @type {Array<Ability>} */
        this.abilities = [];
        AbilityFactory.attachAbilitiesToAura(this, auraData.abilities); //Create the abilities
    }
}