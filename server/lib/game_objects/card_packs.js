const Constants = require("../constants");
const Contants = require("../server_instance")

class CardPack {

    constructor() {
    }

    /** 
     * Function that gets the cards from a pack
     * @param {ServerInstance} server - Server Instance
     * @param {string} set - Set to get cards from
     */
    getCardsFromPack(server, set) {
        let cardList = [];

        //Filter the collection to only keep the desired set
        let filteredCollection = server.cardIndex.filter(card => card.set === set);

        // Define the probabilities for each rarity
        const rarityProbabilities = {
            'COMMON': 0.8,
            'UNCOMMON': 0.4,
            'RARE': 0.2,
            'SUPER RARE': 0.01,
            'LEADER': 0.01,
            'SECRET RARE': 0.05
        };

        // Create a weighted random selection function
        function weightedRandomSelection(collection, probabilities) {
            const totalWeight = collection.reduce((sum, card) => sum + probabilities[card.rarity], 0); //Sum all the cards and their probabilties
            let random = Math.random() * totalWeight;
            for (let card of collection) {
                random -= probabilities[card.rarity];
                if (random < 0) {
                    return card;
                }
            }
        }

        // Select 5 cards based on rarity probabilities
        for (let i = 0; i < 4; i++) {
            let selectedCard = weightedRandomSelection(filteredCollection, rarityProbabilities);
            cardList.push(selectedCard.id);
        }

        //Add one last for the rare card in the end
        filteredCollection = filteredCollection.filter(card => card.rarity !== 'COMMON');
        let selectedCard = weightedRandomSelection(filteredCollection, rarityProbabilities);
        cardList.push(selectedCard.id);

        return cardList;
    }
}

module.exports = CardPack;