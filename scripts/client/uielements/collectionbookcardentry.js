class CollectionBookCardEntry {

    constructor(collectionBook, index, config) {
        this.collectionBook = collectionBook;

        this.x = config.x;
        this.y = config.y;
        this.scale = config.scale;
        this.bookCardAreaHeight = config.bookCardAreaHeight;

        this.firstClickTime = 0;

        this.cardVisual = null;
        this.cardPlaceholder = null;
        
        this.index = index;
        this.cardInfo = null;

        this.cardAmountBox = this.collectionBook.scene.add.graphics();
        this.cardAmountBox.fillStyle(OP_CREAM, 1);
        this.cardAmountBox.fillRoundedRect(this.x - 30, this.y + this.bookCardAreaHeight/2 - 5, 60, 40, 5);
        this.cardAmountBox.lineStyle(4, OP_WHITE, 1); // Border color (orange) with 2px thickness
        this.cardAmountBox.strokeRoundedRect(this.x - 30, this.y + this.bookCardAreaHeight/2 - 5, 60, 40, 5); // Draw the border

        this.cardAmountText = this.collectionBook.scene.add.text(this.x, this.y + this.bookCardAreaHeight/2 + 12, 'x', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#0xD6AA44'
        });
        this.cardAmountText.setOrigin(0.5, 0.5);

        this.cardPlaceholder = new CardVisual(this.collectionBook.scene, config);
        this.cardVisual = new CardVisual(this.collectionBook.scene, config);

        this.cardVisual.setVisible(false);
        this.cardPlaceholder.setVisible(false);

        this.cardVisual.setInteractive();
        this.cardVisual.on('pointerdown', (pointer) => {
            if(pointer.rightButtonDown()) {
                this.collectionBook.scene.cardCraftingPanel.updateArt(this.cardInfo);
                this.collectionBook.scene.cardCraftingPanel.setVisible(true);
            } else {
                if(!this.collectionBook.scene.showingDeckList){
                    //if the firstClicktime is 0 then this we record the time and leave the function
                    this.collectionBook.selectedCard = this.index;
                    if (this.firstClickTime == 0) {
                        this.firstClickTime = new Date().getTime();
                        return;
                    }
                    let elapsed = new Date().getTime() - this.firstClickTime;

                    if (elapsed < 350) {
                        this.collectionBook.scene.addCardToDeck(this.collectionBook.selectedCard);
                    } 
                    this.firstClickTime = 0;  
                }  
            }
        });
        this.cardVisual.on('pointerover', (pointer) =>  {
            this.cardVisual.showBorder(true && !this.collectionBook.scene.isDragging);
        });
        this.cardVisual.on('pointerout', (pointer) => {
            this.cardVisual.showBorder(false);
        });
        this.collectionBook.scene.input.setDraggable(this.cardVisual);
    }

    update() {
        if(this.cardInfo === null) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            
            let availableAmount = this.cardInfo.amount;
            if(this.collectionBook.scene.inDeckBuildingMode) { 
                let amountInDeck = this.collectionBook.scene.getAmountOfCardInDeck(this.cardInfo.id);
                if(this.cardInfo.isleader === 1) {
                    availableAmount = Math.min(CARD_LEADER_LIMIT, this.cardInfo.amount)-amountInDeck;
                } else {
                    availableAmount = Math.min(CARD_LIMIT, this.cardInfo.amount)-amountInDeck;
                }
            } 
            this.cardAmountText.text = 'x' + availableAmount;
                
            this.cardVisual.setUpdate(this.cardInfo);
            this.cardPlaceholder.setUpdate(this.cardInfo);

            availableAmount = Math.min(availableAmount, this.cardInfo.amount);
            if (availableAmount === 0) {
                this.cardVisual.art.setPipeline('GreyscalePipeline');
                this.collectionBook.scene.input.setDraggable(this.cardVisual, false); // Disable dragging
            } else {
                this.cardVisual.art.resetPipeline();
                this.collectionBook.scene.input.setDraggable(this.cardVisual, true); // Enable dragging
            }
        }
    }

    updateCardInfo(cardInfo) {
        this.cardInfo = cardInfo;
    }

    setVisible(visible) {
        this.cardAmountBox.setVisible(visible);
        this.cardAmountText.setVisible(visible);
        this.cardVisual.setVisible(visible);
        this.cardPlaceholder.setVisible(visible);
    }
}