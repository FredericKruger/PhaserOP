/**
 * Card Selection Panel - A flexible UI component for selecting cards based on criteria
 * Similar to mulligan panel but with support for target requirements and varying selection counts
 */
class SelectionPanel extends BaseComponentUI {
    //#region CONSTRUCTOR
    /**
     * @param {GameScene} scene - The scene that will contain the card selection panel
     * @param {Object} config - Configuration options
     * @param {number} config.minSelectCount - Minimum number of cards to select
     * @param {number} config.maxSelectCount - Maximum number of cards to select
     * @param {string} config.selectionTitle - Title to display for the selection panel
     * @param {string} config.selectionDescription - Description of what the player is selecting for
     * @param {Target|Object} config.targetFilter - Target object or config to filter valid cards
     * @param {Function} config.onSelectComplete - Callback when selection is complete
     * @param {Function} config.onCancel - Callback when selection is canceled (optional)
     * @param {boolean} config.allowCancel - Whether selection can be canceled (default: false)
     * @param {boolean} activePlayer - The player who is making the selection
     */
    constructor(scene, config, activePlayer) {
        super(scene);

        this.minSelectCount = config.minSelectCount || 1;
        this.maxSelectCount = config.maxSelectCount || 1;
        this.selectionTitle = config.selectionTitle || "Select Cards";
        this.selectionDescription = config.selectionDescription || ``;
        this.onCancel = config.onCancel || (() => {});
        this.allowCancel = config.allowCancel !== undefined ? config.allowCancel : false;
        this.activePlayer = activePlayer;

        this.selectionSent = false; // Track if selection has been sent to server
        this.numberOfValidCards = 0; // Track number of valid cards

        // Setup target filter
        this.targetFilters = [];
        
        // Card tracking
        this.cards = [];
        this.selectedCards = [];
        this.previouslySelectedCards = []; // Track cards selected in previous steps
        this.selectionStep = 0; // Track which selection step we're on
        this.keepPreviousSelection = true; // Whether to keep previously selected cards
        this.orderCards = false; // Whether to order cards in the selection UI

        this.confirmButtons = []; // Store confirm buttons created dynamically
        
        // Create UI elements
        if(this.activePlayer) {
            this.createBackdrop();
            this.createTitle();
            this.createInfoText();
            this.createButtons();
        }
        
        this.setVisible(false);
    }
    //#endregion

    //#region cardMeetsRequirements
    /**
     * Check if a card meets the selection requirements using Target.js logic
     * @param {GameCardUI} card - The card to check
     * @returns {boolean} - Whether the card is a valid selection target
     */
    cardMeetsRequirements(card) {       
        // Use the Target class isValidTarget method to determine if card meets requirements
        if(this.targetFilters.length === 0) return true; // No filter means all cards are valid

        for(let target of this.targetFilters) {
            if(target.isValidTarget(card)) return true;
        }
        return false;
    }
    //#endregion

    //#region createBackdrop
    /**
     * Create the semi-transparent backdrop
     */
    createBackdrop() {
        this.backdrop = this.scene.add.rectangle(
            this.scene.screenCenterX,
            this.scene.screenCenterY,
            this.scene.screenWidth,
            this.scene.screenHeight,
            0x000000,
            0.75
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.obj.push(this.backdrop);
    }
    //#endregion

    //#region createTitle
    /**
     * Create the title element
     */
    createTitle() {
        this.titleText = this.scene.add.text(
            this.scene.screenCenterX,
            150,
            this.selectionTitle,
            {
                fontFamily: 'OnePieceFont',
                fontSize: '50px',
                color: '#D6AA44',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.obj.push(this.titleText);
    }
    //#endregion

    //#region createInfoText
    /**
     * Create information text
     */
    createInfoText() {
        this.descriptionText = this.scene.add.text(
            this.scene.screenCenterX,
            210,
            this.selectionDescription,
            {
                fontFamily: 'OnePieceFont',
                fontSize: '34px',
                color: '#FFFFFF',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.selectionCountText = this.scene.add.text(
            this.scene.screenCenterX,
            this.scene.screenHeight*0.75,
            `Selected: 0/${this.maxSelectCount}`,
            {
                fontFamily: 'OnePieceFont',
                fontSize: '34px',
                color: '#FFFFFF',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.obj.push(this.descriptionText, this.selectionCountText);
    }
    //#endregion

    //#region 
    setTargets(targets) {
        this.targetFilters = [];
        for(let target of targets) {
            this.targetFilters.push(new Target(target, null));
        }
    }
    //#endregion

    //#region createButtons
    /**
     * Create action buttons
     */
    createButtons() {
        const allowCancelMultiplier = this.allowCancel ? 1 : 0;

        /*this.confirmButton = new Button({
            scene: this.scene,
            x: this.scene.screenCenterX + 140 * allowCancelMultiplier, 
            y: this.scene.screenHeight*0.8,
            width: 150,
            height: 40,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Confirm",
            fontsize: 30,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        this.confirmButton.on('pointerdown', () => {
            this.confirmSelection();
        });*/
                
        if (this.allowCancel) {
            this.cancelButton = new Button({
                scene: this.scene,
                x: this.scene.screenCenterX - 140 * allowCancelMultiplier, 
                y: this.scene.screenHeight*0.8,
                width: 150,
                height: 40,
                radius: 5,
                backgroundcolor: COLOR_ENUMS.OP_CREAM,
                outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
                text: "Cancel",
                fontsize: 30,
                fontfamily: "OnePieceFont",
                textColor: COLOR_ENUMS_CSS.OP_BLACK,
            }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
            
            this.obj.push(this.cancelButton);
        }

        // Add toggle button in bottom left corner
        this.toggleButton = new Button({
            scene: this.scene,
            x: 150, 
            y: this.scene.screenHeight - 100,
            width: 150,
            height: 40,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Hide",
            fontsize: 24,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN + 10); // Higher depth to stay on top
        
        this.toggleButton.setInteractive();
        this.toggleButton.on('pointerover', () => this.toggleButton.postFX.addGlow(COLOR_ENUMS.OP_WHITE, 2));
        this.toggleButton.on('pointerout', () => this.toggleButton.postFX.clear());
        this.toggleButton.on('pointerdown', () => this.togglePanelVisibility());
    

        this.isPanelVisible = true; // Track panel visibility state

        this.obj.push(this.toggleButton);
    }
    //#endregion

    //#region updateConfirmButtons
    /**
     * Update or create confirm buttons based on confirmButtonsList
     * @param {Array} confirmButtonsList - List of button types: ["TOP", "BOTTOM", "OK"]
     */
    updateConfirmButtons(confirmButtonsList) {
        // Clean up existing confirm buttons
        this.confirmButtons.forEach(button => {
            button.destroy();
        });
        this.confirmButtons = [];
        
        // If no confirmButtonsList provided, restore default button
        if (!confirmButtonsList || confirmButtonsList.length === 0) {
            const allowCancelMultiplier = this.allowCancel ? 1 : 0;
            
            this.confirmButton = new Button({
                scene: this.scene,
                x: this.scene.screenCenterX + 140 * allowCancelMultiplier, 
                y: this.scene.screenHeight * 0.8,
                width: 150,
                height: 40,
                radius: 5,
                backgroundcolor: COLOR_ENUMS.OP_CREAM,
                outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
                text: "Confirm",
                fontsize: 30,
                fontfamily: "OnePieceFont",
                textColor: COLOR_ENUMS_CSS.OP_BLACK,
            }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
            
            this.confirmButton.on('pointerdown', () => {
                this.confirmSelection(this.confirmButton, "OK");
            });
            
            this.obj.push(this.confirmButton);
            this.confirmButtons.push(this.confirmButton);
            return;
        }
        
        // Calculate positions based on number of buttons
        const totalButtons = confirmButtonsList.length;
        const totalWidth = totalButtons * 170; // 150px width + 20px margin
        const startX = this.scene.screenCenterX - (totalWidth / 2) + 85; // Center the buttons
        
        // Create a button for each type in confirmButtonsList
        confirmButtonsList.forEach((buttonType, index) => {
            let buttonText = "Confirm";
            let buttonColor = COLOR_ENUMS.OP_CREAM;
            let buttonBorderColor = COLOR_ENUMS.OP_CREAM_DARKER;
            let textColor = COLOR_ENUMS_CSS.OP_BLACK;
            
            // Set button properties based on type
            switch (buttonType) {
                case "TOP":
                    buttonText = "Send to Top";
                    buttonColor = COLOR_ENUMS.OP_BLUE;
                    buttonBorderColor = COLOR_ENUMS.OP_BLUE_DARKER;
                    textColor = COLOR_ENUMS_CSS.OP_WHITE;
                    break;
                case "BOTTOM":
                    buttonText = "Send to Bottom";
                    buttonColor = COLOR_ENUMS.OP_RED;
                    buttonBorderColor = COLOR_ENUMS.OP_RED_DARKER;
                    textColor = COLOR_ENUMS_CSS.OP_WHITE;
                    break;
                case "OK":
                default:
                    buttonText = "Confirm";
                    break;
            }
            
            // Create the button
            const button = new Button({
                scene: this.scene,
                x: startX + (index * 170), 
                y: this.scene.screenHeight * 0.8,
                width: 150,
                height: 40,
                radius: 5,
                backgroundcolor: buttonColor,
                outlinecolor: buttonBorderColor,
                text: buttonText,
                fontsize: 22,
                fontfamily: "OnePieceFont",
                textColor: textColor,
            }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
            
            // Add click handler with the specific button type
            button.on('pointerdown', () => {
                this.confirmSelection(button, buttonType);
            });
            
            this.obj.push(button);
            this.confirmButtons.push(button);
        });
    }
    //#endregion

    //#region prepareSelection
    /**
     * Start the selection process with the given cards
     * @param {Array} cards - Array of cards to choose from
     */
    prepareSelection(cards) {
        this.cards = [];
        this.selectedCards = [];
        
        // Remove any existing card displays
        this.clearCardDisplays();
                
        if(this.activePlayer){
            // Check each card against requirements and adjust visual feedback
            cards.forEach((card, index) => {
                const meetsRequirements = this.cardMeetsRequirements(card);
                
                // Create a display version of the card
                const cardObj = this.createCardDisplay(card, cards.length, index, meetsRequirements);
                this.cards.push({
                    card: card,
                    display: cardObj,
                    originalY: cardObj.y, // Store original Y position
                    selected: false,
                    meetsRequirements: meetsRequirements,
                    wasPreviouslySelected: false
                });
            });
            // Reset and show the UI
            this.updateSelectionCountText();
            
            //Set Game State to passive
            this.scene.gameState.exit(GAME_STATES.NO_INTERACTION);

            // If this is the first step, animate the panel in
            if (this.selectionStep === 0) {
                this.setVisible(true);
                this.animatePanelAppearance();
            }
        } else {
            // Check each card against requirements and adjust visual feedback
            cards.forEach((card, index) => {
                // Create a display version of the card
                const cardObj = this.createOpponentCardDisplay(cards.length, index);
                this.cards.push({
                    card: null,
                    display: cardObj,
                    originalY: cardObj.y // Store original Y position
                });
            });

            if (this.selectionStep === 0) {
                this.setVisible(true);
                this.animateOpponentPanelAppearance();
            }
        }
    }
    //#endregion

    //#region startSelection
    startSelection(params) {
        if(this.activePlayer){
            this.minSelectCount = params.selectionAmount;
            this.selectionDescription = params.selectionText || ``;
            this.selectionSent = false;
            this.keepPreviousSelection = params.keepPreviousSelection;
            this.orderCards = params.orderCards;
            this.confirmButtonsList = params.confirmButtons;
        
            this.setTargets(params.selectedTarget || []);

            // Increment selection step
            this.selectionStep++;

            // Clear previous selection if not keeping it
            if (!this.keepPreviousSelection) {
                // Remember previously selected cards
                this.previouslySelectedCards = this.previouslySelectedCards.concat(this.selectedCards);
            }
            // Clear current selection
            this.selectedCards = [];

            this.updateConfirmButtons(this.confirmButtonsList);
            this.updateSelectionCountText();
            this.descriptionText.setText(this.selectionDescription);

            // Reset selected cards
            this.updateCardDisplays();
            
            //Calculate the number of valid targets
            for(let card of this.cards) {
                if(this.cardMeetsRequirements(card.display)) {
                    this.numberOfValidCards++;
                }
            }

            if(this.numberOfValidCards === 0) {
                //this.confirmButton.setText("No Valid Cards");
                this.selectionCountText.setText("No Valid Cards");
            } else {
                //this.confirmButton.setText(`Confirm (${this.selectedCards.length})`);
            }
        }
    }
    //#endregion

    //#region resetSelection
    resetSelection() {
        this.selectionSent = false;
    }
    //#endregion

    //#region createCardDisplay
    /**
     * Create a display version of a card for selection
     * @param {Object} card - The card data
     * @param {number} numberCards - The total number of cards
     * @param {number} index - Index position
     * @param {boolean} meetsRequirements - Whether the card meets selection requirements
     * @return {Phaser.GameObjects.Container} The card display object
     */
    createCardDisplay(card, numberCards, index, meetsRequirements) {
        // Calculate position based on index and total cards
        const cardWidth = (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN);
        const cardHeight = (GAME_UI_CONSTANTS.CARD_ART_HEIGHT * CARD_SCALE.IN_MULLIGAN);
        const totalSeparatorWidth = Math.max(numberCards - 1, 0) * 20;
        const row = Math.floor(index / 5);
        const col = index % 5;
        
        const centerOffset = (Math.min(numberCards - row * 5, 5) * cardWidth) / 2 - (cardWidth/2) + totalSeparatorWidth/2;
        const x = this.scene.screenCenterX - centerOffset + col * cardWidth + col * 20;
        const y = this.scene.screenCenterY - 30 + row * cardHeight;
        
        // Create a card UI object for display
        const cardUI = new GameCardUI(this.scene, this.scene.activePlayerScene, {
            x: x,
            y: y,
            scale: CARD_SCALE.IN_MULLIGAN,
            artVisible: true,
            depth: DEPTH_VALUES.CARD_IN_MULLIGAN + 1,
            id: card.id,
        });
        cardUI.setScale(0);
        
        cardUI.updateCardData(card.cardData || card);
        
        // Add to displayable objects
        this.obj.push(cardUI);
        
        return cardUI;
    }
    //#endregion

    //#region createOpponentCardDisplay
    /**
     * Create a display version of a card for selection
     * @param {number} numberCards - The total number of cards
     * @param {number} index - Index position
     * @return {Phaser.GameObjects.Container} The card display object
     */
    createOpponentCardDisplay(numberCards, index) {
        // Calculate position based on index and total cards
        const cardWidth = (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_SELECTION_PASSIVE_PLAYER);
        const cardHeight = (GAME_UI_CONSTANTS.CARD_ART_HEIGHT * CARD_SCALE.IN_SELECTION_PASSIVE_PLAYER);
        const totalSeparatorWidth = Math.max(numberCards - 1, 0) * 20;
        const row = Math.floor(index / 5);
        const col = index % 5;
        
        const centerOffset = (Math.min(numberCards - row * 5, 5) * cardWidth) / 2 - (cardWidth/2) + totalSeparatorWidth/2;
        const x = this.scene.screenCenterX - centerOffset + col * cardWidth + col * 20;
        const y = this.scene.screenHeight * 0.3 - 30 + row * cardHeight;
        
        // Create a card UI object for display
        const cardUI = new GameCardUI(this.scene, this.scene.activePlayerScene, {
            x: x,
            y: y,
            scale: CARD_SCALE.IN_SELECTION_PASSIVE_PLAYER,
            artVisible: false,
            depth: DEPTH_VALUES.CARD_IN_MULLIGAN + 1,
            id: index,
        });
        cardUI.setScale(0);
        
        // Add to displayable objects
        this.obj.push(cardUI);
        
        return cardUI;
    }
    //#endregion

    //#region updateCardDisplays
    updateCardDisplays() {
        this.cards.forEach((card, index) => {
           // Check if card was previously selected (and we're not keeping those selections)
            const wasPreviouslySelected = !this.keepPreviousSelection && 
                this.previouslySelectedCards.some(prevCard => prevCard.id === card.card.id);
              
            const meetsRequirements = this.cardMeetsRequirements(card.display);

            card.meetsRequirements = meetsRequirements; // Update the card's meetsRequirements state
            card.wasPreviouslySelected = wasPreviouslySelected; // Update the card's previously selected state

            card.display.setInteractive({ useHandCursor: true });

            //Untoggle if any is already selected
            if(card.selected) {
                this.toggleCardSelection(index, true); //remove selection
                // Reset to initial position and scale
                this.scene.tweens.killTweensOf(card.display);
                card.display.y = card.originalY; // Adjust Y position (undo the -30 from selection)
                card.display.setScale(CARD_SCALE.IN_MULLIGAN); // Reset to original scale
            }

            // Remove any previous "Unavailable" text and overlay if they exist
            if (card.unavailableText) {
                card.unavailableText.destroy();
                card.unavailableText = null;
            }
            
            if (card.overlay) {
                card.overlay.destroy();
                card.overlay = null;
            }

            // Remove any previous event listeners to prevent duplicates
            card.display.removeAllListeners('pointerdown');
            card.display.removeAllListeners('pointerover');
            card.display.removeAllListeners('pointerout');

            // Add visual feedback if card doesn't meet requirements
            if (!meetsRequirements || wasPreviouslySelected) {
                card.display.setAlpha(0.8);
                
                // Add a overlay to indicate card doesn't meet requirements
                const overlay = this.scene.add.rectangle(
                    0, 0, 
                    card.display.width, 
                    card.display.height,
                    0x000000, 0.5
                ).setOrigin(0.5);
                
                card.display.add(overlay);
                card.overlay = overlay; // Store reference for later cleanup
                
                const unavailableText = this.scene.add.text(
                    0, 0,
                    "Unavailable",
                    {
                        fontFamily: 'OnePieceFont',
                        fontSize: '75px',
                        color: '#FF0000',
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setAngle(-30);
                
                card.display.add(unavailableText);
                card.unavailableText = unavailableText; // Store reference for later removal

            } else {
                card.display.setAlpha(1);

                // Add selection events for eligible cards
                card.display.on('pointerdown', () => {
                    this.toggleCardSelection(index);
                });
                
                // Add hover effect
                card.display.on('pointerover', () => {
                    if (!card.selected) {
                        this.scene.tweens.add({
                            targets: card.display,
                            y: card.originalY - 15,
                            scale: CARD_SCALE.IN_MULLIGAN * 1.1,
                            duration: 200,
                            ease: 'Sine.easeOut'
                        });
                    }
                });
                
                card.display.on('pointerout', () => {
                    if (!card.selected) {
                        this.scene.tweens.add({
                            targets: card.display,
                            y: card.originalY,
                            scale: CARD_SCALE.IN_MULLIGAN,
                            duration: 200,
                            ease: 'Sine.easeOut'
                        });
                    }
                });
            }
        });
    }
    //#endregion

    //#region animateCardRefresh
    /**
     * Animate refreshing the cards for a new selection step
     */
    animateCardRefresh() {
        // Fade out all existing cards
        const cardDisplays = this.cards.map(c => c.display);
        
        // Update description text with new info
        this.scene.tweens.add({
            targets: this.descriptionText,
            alpha: 0,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
        
        // Scale down cards, then bring new ones in
        this.scene.tweens.add({
            targets: cardDisplays,
            scale: 0.1,
            alpha: 0.5,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                // Bring new cards in with staggered timing
                this.cards.forEach((cardItem, index) => {
                    this.scene.tweens.add({
                        targets: cardItem.display,
                        scale: 0.35,
                        alpha: 1,
                        delay: index * 30,
                        duration: 300,
                        ease: 'Back.easeOut'
                    });
                });
            }
        });
    }
    //#endregion

    //#region updateSelectionCountText
    /**
     * Update the selection count text
     */
    updateSelectionCountText() {
        this.selectionCountText.setText(`Selected: ${this.selectedCards.length}/${this.minSelectCount}`);
        
        // Color based on whether we've met minimum requirements
        if (this.selectedCards.length < this.minSelectCount) {
            this.selectionCountText.setColor('#FF9999');
        } else if (this.selectedCards.length === this.minSelectCount) {
            this.selectionCountText.setColor('#99FFAA');
        } else {
            this.selectionCountText.setColor('#FFFFFF');
        }
    }
    //#endregion

    //#region animatePanelAppearance
    /**
     * Animate the panel appearing
     */
    animatePanelAppearance() {
        // Start with elements scaled down
        this.titleText.setAlpha(0);
        this.descriptionText.setAlpha(0);
        this.selectionCountText.setAlpha(0);
        this.toggleButton.setAlpha(0); // Also start with toggle button hidden
        
        if (this.allowCancel) {
            this.cancelButton.setAlpha(0);
        }
        
        // Fade in backdrop
        this.scene.tweens.add({
            targets: this.backdrop,
            alpha: { from: 0, to: 0.7 },
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Fade in text elements
                this.scene.tweens.add({
                    targets: [this.titleText, this.descriptionText, this.selectionCountText],
                    alpha: 1,
                    duration: 300,
                    ease: 'Sine.easeOut'
                });
                
                // Fade in buttons
                const buttonTargets = [this.toggleButton];
                if (this.allowCancel) buttonTargets.push(this.cancelButton);
                
                this.scene.tweens.add({
                    targets: buttonTargets,
                    alpha: 1,
                    duration: 300,
                    delay: 200,
                    ease: 'Sine.easeOut'
                });
                
                // Animate cards appearing with staggered delay
                this.cards.forEach((cardItem, index) => {
                    cardItem.display.setScale(0);
                    
                    this.scene.tweens.add({
                        targets: cardItem.display,
                        scale: CARD_SCALE.IN_MULLIGAN,
                        delay: 200 + index * 50,
                        duration: 300,
                        ease: 'Back.easeOut'
                    });
                });
            }
        });
    }
    //#endregion

    //#region animateOpponentPanelAppearance
    /**
     * Animate the panel appearing
     */
    animateOpponentPanelAppearance() {
        // Animate cards appearing with staggered delay
        this.cards.forEach((cardItem, index) => {
            cardItem.display.setScale(0);
            
            this.scene.tweens.add({
                targets: cardItem.display,
                scale: CARD_SCALE.IN_SELECTION_PASSIVE_PLAYER,
                delay: 200 + index * 50,
                duration: 300,
                ease: 'Back.easeOut'
            });
        });
    }
    //#endregion

    //#region clearCardDisplays
    /**
     * Clear all card display objects
     */
    clearCardDisplays() {
        this.cards.forEach(cardItem => {
            if (cardItem.display) {
                cardItem.display.destroy();
            }
            if (cardItem.checkmark) {
                cardItem.checkmark.destroy();
            }
        });
    }
    //#endregion

    //#region togglePanelVisibility
    /**
     * Toggle the panel visibility between shown and hidden states
     */
    togglePanelVisibility() {
        if (this.isPanelVisible) {
            // Hide panel elements except toggle button
            this.hidePanel();
        } else {
            // Show all panel elements
            this.showPanel();
        }
        
        // Toggle state
        this.isPanelVisible = !this.isPanelVisible;
    }
    //#endregion

    //#region hidePanel
    /**
     * Hide panel elements except toggle button
     */
    hidePanel() {
        // Update toggle button text
        this.toggleButton.setText("Show Panel");
        
        // Fade out all elements except toggle button
        const elementsToHide = this.obj.filter(obj => obj !== this.toggleButton);
        
        // Also hide card displays
        const cardDisplays = this.cards.map(card => card.display);
        
        // Combine all elements to hide
        const allElementsToHide = [...elementsToHide, ...cardDisplays];
        
        this.scene.tweens.add({
            targets: allElementsToHide,
            alpha: 0,
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // After animation, set visible false for better performance
                let numberOfElements = allElementsToHide.length;
                let currentElementIndex = 0;
                allElementsToHide.forEach(obj => {
                    if (obj) obj.setVisible(false);
                    currentElementIndex++;

                    if(currentElementIndex === numberOfElements) this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
                });
            }
        });
    }
    //#endregion

    //#region showPanel
    /**
     * Show all panel elements
     */
    showPanel() {
        this.scene.gameState.exit(GAME_STATES.NO_INTERACTION);

        // Update toggle button text
        this.toggleButton.setText("Hide Panel");
        
        // Get all elements except toggle button
        const elementsToShow = this.obj.filter(obj => obj !== this.toggleButton);
        
        // Also show card displays
        const cardDisplays = this.cards.map(card => card.display);
        
        // Combine all elements to show
        const allElementsToShow = [...elementsToShow, ...cardDisplays];
        
        // First make them visible with alpha 0
        allElementsToShow.forEach(obj => {
            if (obj) {
                obj.setVisible(true);
                obj.setAlpha(0);
            }
        });
        
        // Then fade them in
        this.scene.tweens.add({
            targets: allElementsToShow,
            alpha: 1,
            duration: 300,
            ease: 'Sine.easeIn'
        });
    }
    //#endregion

    //#region toggleCardSelection
    /**
     * Toggle selection state for a card
     * @param {number} index - The index of the card in the cards array
     */
    toggleCardSelection(index, forceToggle = false) {
        const cardItem = this.cards[index];
        
        // Skip if card doesn't meet requirements
        if (!forceToggle && !this.cardMeetsRequirements(cardItem.display)) return;
        
        // Check if we're at max selections and trying to select another
        if (!forceToggle && !cardItem.selected && this.selectedCards.length >= this.minSelectCount) {
            this.shakeCard(cardItem.display);
            return;
        }
        
        // Toggle selection state
        cardItem.selected = !cardItem.selected;
        
        // Update selected cards array
        if (cardItem.selected) {
            this.selectedCards.push(cardItem.card);
            
            // Visual feedback for selection
            this.scene.tweens.add({
                targets: cardItem.display,
                y: cardItem.display.y - 30,
                scale: 0.4,
                duration: 200,
                ease: 'Back.easeOut'
            });

            // Add selection number indicator
            if (this.orderCards) {
                // Create number text
                const selectionNumber = this.scene.add.text(
                    cardItem.display.x,
                    cardItem.display.y - 30,
                    this.selectedCards.length.toString(),
                    {
                        fontFamily: 'OnePieceTCGFont',
                        fontSize: '80px',
                        color: '#FFFFFF',
                        stroke: '#000000',
                        strokeThickness: 5
                    }
                ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN + 3);

                // Store references for later removal
                cardItem.selectionNumber = selectionNumber;

                // Add to objects array for management
                this.obj.push(selectionNumber);

                // Animate number appearing
                selectionNumber.setScale(0);
                
                this.scene.tweens.add({
                    targets: [selectionNumber],
                    scale: 1,
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            }
            
            // Add glow effect
            cardItem.display.showGlow(COLOR_ENUMS.OP_ORANGE);
        } else {
            // Remove from selected cards
            const cardIndex = this.selectedCards.indexOf(cardItem.card);
            if (cardIndex !== -1) {
                this.selectedCards.splice(cardIndex, 1);
            }
            
            // Return to normal state
            this.scene.tweens.add({
                targets: cardItem.display,
                y: cardItem.display.y + 30,
                scale: 0.35,
                duration: 200,
                ease: 'Sine.easeOut'
            });

            // Remove number indicator if it exists
            if(cardItem.selectionNumber && this.orderCards) {
                this.scene.tweens.add({
                    targets: [cardItem.selectionNumber],
                    scale: 0,
                    duration: 200,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        cardItem.selectionNumber.destroy();
                        cardItem.selectionNumber = null;
                        this.updateSelectionNumbers();
                    }
                });
            }
            
            // Remove glow
            cardItem.display.hideGlow();
        }
        
        // Update UI elements
        this.updateSelectionCountText();
    }
    //#endregion

    //#region updateSelectionNumbers
    /**
     * Update the selection numbers on all selected cards
     * to reflect their current order in the selectedCards array
     */
    updateSelectionNumbers(currentNumber) {
        if (!this.orderCards) return;
        
        // Update numbers on all selected cards
        this.cards.forEach(cardItem => {
            if (cardItem.selected && cardItem.selectionNumber) {
                // Find the card's index in the selectedCards array
                const cardIndex = this.selectedCards.findIndex(c => c.id === cardItem.card.id);
                
                if (cardIndex !== -1) {
                    // Update the number text
                    cardItem.selectionNumber.setText((cardIndex + 1).toString());
                    
                    // Briefly highlight the number to show it's been updated
                    this.scene.tweens.add({
                        targets: [cardItem.selectionNumber],
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 150,
                        yoyo: true,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        });
    }
    //#endregion

    //#region shakeCard
    /**
     * Shake a card to indicate it can't be selected
     * @param {Phaser.GameObjects.Container} card - The card to shake
     */
    shakeCard(card) {
        const originalX = card.x;
        
        this.scene.tweens.add({
            targets: card,
            x: originalX - 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                card.x = originalX;
            }
        });
    }
    //#endregion

    //#region shakeButton
    /**
     * Shake a button to indicate it can't be pressed
     * @param {Button} button - The button to shake
     */
    shakeButton(button) {
        const originalX = button.x;
        
        this.scene.tweens.add({
            targets: button,
            x: originalX - 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                button.x = originalX;
            }
        });
    }
    //#endregion

    //#region confirmSelection
    /**
     * Confirm the current selection
     */
    confirmSelection(button, destinationButton) {
        if (this.selectionSent 
            || (this.numberOfValidCards > 0 && this.selectedCards.length < this.minSelectCount)
        ) {
            // Can't confirm yet - not enough cards selected
            this.shakeButton(button);
            return;
        }

        let destination = "";
        if( destinationButton === "TOP") 
            destination = "TOP";
        else if( destinationButton === "BOTTOM") 
            destination = "BOTTOM";

        let selectedCardIds = this.selectedCards.map(card => card.id);
        this.selectionSent = true;
        this.scene.game.gameClient.requestSendSelection(selectedCardIds, destination);
    }
    //#endregion

    //#region animatePanelDisappearance
    /**
     * Animate the panel disappearing
     * @param {Function} onComplete - Callback when animation completes
     */
    animatePanelDisappearance(onComplete) {
        // Fade out cards first
        const cardDisplays = this.cards.map(c => c.display);

        // Only include card numbers that actually exist
        const cardNumbers = this.cards
            .filter(c => c.selectionNumber)
            .map(c => c.selectionNumber);
        
        // Combine all elements to animate together
        const elementsToFade = [...cardDisplays];
        if (cardNumbers.length > 0) {
            elementsToFade.push(...cardNumbers);
        }

        this.scene.tweens.add({
            targets: elementsToFade,
            alpha: 0,
            scale: 0.2,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                // Then fade out UI elements
                let uiElements = [{}];
                
                if(this.activePlayer) {
                    uiElements = [
                        this.titleText, this.descriptionText, 
                        this.selectionCountText, ...this.confirmButtons, this.toggleButton
                    ];
                    
                    if (this.allowCancel) {
                        uiElements.push(this.cancelButton);
                    }
                }
                
                this.scene.tweens.add({
                    targets: uiElements,
                    alpha: 0,
                    duration: 200,
                    ease: 'Sine.easeIn',
                    onComplete: () => {
                        this.setVisible(false);
                        this.clearCardDisplays();
                        
                        if (onComplete) {
                            onComplete();
                        }
                        if(this.activePlayer) this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
                    }
                });
            }
        });
    }
    //#endregion

}
