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
        this.cardData = null;

        this.cardAmountBox = this.collectionBook.scene.add.graphics();
        this.cardAmountBox.fillStyle(COLOR_ENUMS.OP_CREAM, 1);
        this.cardAmountBox.fillRoundedRect(this.x - 30, this.y + this.bookCardAreaHeight/2 - 5, 60, 40, 5);
        this.cardAmountBox.lineStyle(4, COLOR_ENUMS.OP_WHITE, 1); // Border color (orange) with 2px thickness
        this.cardAmountBox.strokeRoundedRect(this.x - 30, this.y + this.bookCardAreaHeight/2 - 5, 60, 40, 5); // Draw the border

        this.cardAmountText = this.collectionBook.scene.add.text(this.x, this.y + this.bookCardAreaHeight/2 + 12, 'x', {
            font: '28px OnePieceFont',
            color: COLOR_ENUMS_CSS.OP_RED
        });
        this.cardAmountText.setOrigin(0.5, 0.5);

        this.cardPlaceholder = new CardVisual(this.collectionBook.scene, config);
        this.cardVisual = new CardVisual(this.collectionBook.scene, config);

        this.cardVisual.setVisible(false);
        this.cardPlaceholder.setVisible(false);

        this.cardVisual.setInteractive();
        this.cardVisual.on('pointerdown', (pointer) => {
            if(pointer.rightButtonDown()) {
                this.collectionBook.scene.cardCraftingPanel.updateArt(this.cardData);
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
        if(this.cardData === null) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            
            let availableAmount = this.cardData.amount;
            if(this.collectionBook.scene.inDeckBuildingMode) { 
                let amountInDeck = this.collectionBook.scene.getAmountOfCardInDeck(this.cardData.id);
                if(this.cardData.isleader === 1) {
                    availableAmount = Math.min(GAME_ENUMS.CARD_LEADER_LIMIT, this.cardData.amount)-amountInDeck;
                } else {
                    availableAmount = Math.min(GAME_ENUMS.CARD_LIMIT, this.cardData.amount)-amountInDeck;
                }
            } 
            this.cardAmountText.text = 'x' + availableAmount;
                
            this.cardVisual.setUpdate(this.cardData);
            this.cardPlaceholder.setUpdate(this.cardData);

            availableAmount = Math.min(availableAmount, this.cardData.amount);
            if (availableAmount === 0) {
                this.cardVisual.art.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);
                this.collectionBook.scene.input.setDraggable(this.cardVisual, false); // Disable dragging
            } else {
                this.cardVisual.art.resetPipeline();
                this.collectionBook.scene.input.setDraggable(this.cardVisual, true); // Enable dragging
            }
            if (availableAmount === 1) {
                this.cardPlaceholder.art.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);
            } else {
                this.cardPlaceholder.art.resetPipeline();
            }
        }
    }

    updateCardData(cardData) {
        this.cardData = cardData;
    }

    setVisible(visible) {
        this.cardAmountBox.setVisible(visible);
        this.cardAmountText.setVisible(visible);
        this.cardVisual.setVisible(visible);
        this.cardPlaceholder.setVisible(visible);
    }
}