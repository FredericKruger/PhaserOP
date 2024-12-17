class CollectionManager extends Phaser.Scene {
    constructor () {
        super({key: 'collectionmanager'});

        this.cardIndex = null;
        this.colorCardIndex = [];
        this.colorCardInfo = [];
        this.cardToCardi = [];

        this.pageMax = 1;
 
        this.obj = [];

        this.selectedDeck = -1;

        this.cardTooltipContainer = null;
        this.deckListContainer = null;

        this.isDragging = false;
        this.showingDeckList = true;
        this.firstLoad = true;

        this.collectionBook = null;
    }

    /*init (data) {
        this.cardIndex = data.CardIndex;
        this.cardIndex = this.cardIndex.sort(function (a, b) {
            return a.colorid - b.colorid || a.cost - b.cost || a.collectionnb - b.collectionnb;
        });
        
        this.cardToCardi = new Array(this.cardIndex.length);
        for(let i = 0; i<this.cardIndex.length; i++)
            this.cardToCardi[this.cardIndex[i].collectionnb-1] = i;

        this.pageMax = 0;
        let startIndex = 0;
        for(let i = 0; i<6; i++){
            this.colorCardIndex[i] = this.cardIndex.filter(item => item.colorid === (i+1));

            this.colorCardInfo[i] = {
                startPage: this.pageMax+1,
                startIndex: startIndex,
                totalPages: 0,
                numberCards: this.colorCardIndex[i].length,
                hidden: false
            };

            if(this.colorCardIndex[i].length > 0) {
                this.colorCardInfo[i].totalPages = Math.floor(this.colorCardIndex[i].length/maxCardsPerPage)+1;
                this.pageMax +=this.colorCardInfo[i].totalPages;
            }

            startIndex += this.colorCardIndex[i].length;
        }
    }*/

}