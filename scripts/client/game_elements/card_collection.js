class CardCollection {

    constructor() {
        this.cardCollection = [];

        /** this data is necessary for the  */
        this.colorCardIndex = [];
        this.colorCardData = [];
        this.cardToCardi = [];

        /** List of filters */
        this.collectionFilters = [];
    }

    /** Initial load of the cards list 
     * @param {Array} cardList - Array of card objects
    */
    loadCards(cardList) {
        for(let card of cardList) {
            let cardData = new CardData();
            cardData.setCardData(card);
            this.cardCollection.push(cardData);
        }
    }

    /** Update the player collection  
     * @param {Array} playerCollection - Array of arrays with the card index and the amount
    */
    updateCollection (playerCollection) {
        for(let i = 0; i<playerCollection.length; i++) {
            let index = playerCollection[i][0];
            let amount = playerCollection[i][1];
            this.cardCollection[index-1].setAmount(amount);
        }
    }

    /** Filter the collection according to color and other critera 
     * returns the total number of pages
    */
    filterCollection () {
        let pageMax = 0;
        let startIndex = 0;

        //group filters by type
        const groupedFilters = this.collectionFilters.reduce((acc, filter) => {
            if (!acc[filter.type]) {
                acc[filter.type] = [];
            }
            acc[filter.type].push(filter.value);
            return acc;
        }, {});

        for(let i = 0; i<GAME_ENUMS.CARD_COLORS.length; i++) {
            //First filter the cards
            this.colorCardIndex[i] = this.cardCollection.filter(item => item.colors.includes(GAME_ENUMS.CARD_COLORS[i]) && item.amount > 0);

            // Apply custom filters
            for (const [type, values] of Object.entries(groupedFilters)) {
                this.colorCardIndex[i] = this.colorCardIndex[i].filter(item => {
                    switch (type) {
                        case 'cost':
                            return values.includes(item.cost);
                        case 'attribute':                     
                            return values.includes(item.attribute);
                        case 'set':
                            return values.includes(item.set);
                        case 'text':
                            return (
                                item.name.toLowerCase().includes(values[0].toLowerCase())
                                || item.rarity.toLowerCase().includes(values[0].toLowerCase())
                                || item.type.some(type => type.toLowerCase().includes(values[0].toLowerCase()))
                            );
                        default:
                            return true;
                    }
                });
            };

            //Then sort the cards
            this.colorCardIndex[i] = this.colorCardIndex[i].sort(function (a, b) {
                return b.isleader - a.isleader || a.cost - b.cost || a.id - b.id;
            });

            //Create page info
            this.colorCardData[i] = {
                startPage: pageMax+1,
                startIndex: startIndex,
                totalPages: 1,
                numberCards: this.colorCardIndex[i].length,
                hidden: false
            };

            //Increase variables
            if(this.colorCardIndex[i].length > 0) {
                this.colorCardData[i].totalPages = Math.floor(this.colorCardIndex[i].length/GAME_ENUMS.MAX_CARDS_PER_PAGE)+1;
            }
            pageMax +=this.colorCardData[i].totalPages;

            startIndex += this.colorCardIndex[i].length;
        }

        return pageMax;
    }

    /** Get Cards 
     * @param {number} color - Color index
     * @param {number} index - Page index
    */
    getCardFromPage(color, index) {
        return this.colorCardIndex[color][index];
    }

    /** Add a filter 
     * @param {Object} filter - Filter object
    */
    addFilter(filter) {
        this.collectionFilters.push(filter);
        this.filterCollection();
    }

    /** Remove a filter 
     * @param {Object} filter - Filter object
    */
    removeFilter(filter) {
        //locate the filter
        let index = -1;
        if(filter.type === 'text') {
            index = this.collectionFilters.findIndex(f => f.type === filter.type);
        } else {
            index = this.collectionFilters.findIndex(f => f.type === filter.type && f.value === filter.value);
        }

        if(index !== -1) {
            this.collectionFilters.splice(index, 1);
            this.filterCollection();
        }
    }

}