class CardCollection {

    constructor() {
        this.cardCollection = [];

        /** this data is necessary for the  */
        this.colorCardIndex = [];
        this.colorCardInfo = [];
        this.cardToCardi = [];

        /** List of filters */
        this.collectionFilters = [];
    }

    /** Initial load of the cards list */
    loadCards(cardList) {
        this.cardCollection = cardList;

        for(let card of this.cardCollection) {
            card.amount = 0;
        }
    }

    /** Update the player collection  */
    updateCollection (playerCollection) {
        for(let i = 0; i<playerCollection.length; i++) {
            let index = playerCollection[i][0];
            let amount = playerCollection[i][1];
            this.cardCollection[index-1].amount = amount;
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

        for(let i = 0; i<CARD_COLORS.length; i++) {
            //First filter the cards
            this.colorCardIndex[i] = this.cardCollection.filter(item => item.colors.includes(CARD_COLORS[i]) && item.amount > 0);

            // Apply custom filters
            for (const [type, values] of Object.entries(groupedFilters)) {
                this.colorCardIndex[i] = this.colorCardIndex[i].filter(item => {
                    switch (type) {
                        case 'cost':
                            return values.includes(item.cost);
                        case 'attribute':                     
                            return values.includes(item.attribute);
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
            this.colorCardInfo[i] = {
                startPage: pageMax+1,
                startIndex: startIndex,
                totalPages: 1,
                numberCards: this.colorCardIndex[i].length,
                hidden: false
            };

            //Increase variables
            if(this.colorCardIndex[i].length > 0) {
                this.colorCardInfo[i].totalPages = Math.floor(this.colorCardIndex[i].length/maxCardsPerPage)+1;
            }
            pageMax +=this.colorCardInfo[i].totalPages;

            startIndex += this.colorCardIndex[i].length;
        }

        return pageMax;
    }

    /** Get Cards */
    getCardFromPage(color, index) {
        return this.colorCardIndex[color][index];
    }

    /** Add a filter */
    addFilter(filter) {
        this.collectionFilters.push(filter);
        this.filterCollection();
    }

    /** Remove a filter */
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