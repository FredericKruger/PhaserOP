class CardCollection {

    constructor() {
        this.cardCollection = [];

        /** this data is necessary for the  */
        this.colorCardIndex = [];
        this.colorCardInfo = [];
        this.cardToCardi = [];
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
        for(let i = 0; i<CARD_COLORS.length; i++) {
            //First filter the cards
            this.colorCardIndex[i] = this.cardCollection.filter(item => item.colors.includes(CARD_COLORS[i]) && item.amount > 0);

            //Then sort the cards
            this.colorCardIndex[i] = this.colorCardIndex[i].sort(function (a, b) {
                return b.isleader - a.isleader || a.cost - b.cost || a.id - b.id;
            });

            //Create page info
            this.colorCardInfo[i] = {
                startPage: pageMax+1,
                startIndex: startIndex,
                totalPages: 0,
                numberCards: this.colorCardIndex[i].length,
                hidden: false
            };

            //Increase variables
            if(this.colorCardIndex[i].length > 0) {
                this.colorCardInfo[i].totalPages = Math.floor(this.colorCardIndex[i].length/maxCardsPerPage)+1;
                pageMax +=this.colorCardInfo[i].totalPages;
            }

            startIndex += this.colorCardIndex[i].length;
        }

        return pageMax;
    }

    /** Get Cards */
    getCardFromPage(color, index) {
        return this.colorCardIndex[color][index];
    }

}